"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  LiveKitRoom,
  useLocalParticipant,
  useRoomContext,
  useTracks,
  VideoTrack,
  AudioTrack,
} from "@livekit/components-react";
import { Track, RoomEvent } from "livekit-client";
import { createClient } from "@/lib/supabase/client";
import { formatILS, formatDuration } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function CallPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);
  const [room, setRoom] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("calls")
      .select("livekit_room, status")
      .eq("id", id)
      .single()
      .then(async ({ data }) => {
        if (!data) { setError("שיחה לא נמצאה"); return; }
        setRoom(data.livekit_room);

        const res = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ callId: id, room: data.livekit_room }),
        });

        if (!res.ok) { setError("שגיאה בחיבור לשיחה"); return; }
        const { token, url } = await res.json();
        setToken(token);
        setLivekitUrl(url);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-svh bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">מתחבר לשיחה...</p>
        </div>
      </div>
    );
  }

  if (error || !token || !livekitUrl || !room) {
    return (
      <div className="min-h-svh bg-black flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-white mb-6">{error ?? "שגיאה בחיבור"}</p>
          <Button onClick={() => router.replace("/dashboard")}>חזור לדשבורד</Button>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={livekitUrl}
      connect={true}
      audio={true}
      video={false}
      className="min-h-svh bg-black flex flex-col max-w-[430px] mx-auto"
      onDisconnected={() => router.replace(`/call/${id}/review`)}
    >
      <CallUI callId={id} room={room} />
    </LiveKitRoom>
  );
}

function CallUI({ callId, room }: { callId: string; room: string }) {
  const roomCtx = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const router = useRouter();

  const [elapsed, setElapsed] = useState(0);
  const [charged, setCharged] = useState(0);
  const [ratePerMinute, setRatePerMinute] = useState(1000);
  const [lowBalance, setLowBalance] = useState(false);
  const [muted, setMuted] = useState(false);
  const [screenShare, setScreenShare] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [ending, setEnding] = useState(false);
  const [remoteParticipantName, setRemoteParticipantName] = useState("מומחה");

  // Remote audio tracks
  const tracks = useTracks([Track.Source.Microphone], { onlySubscribed: true });

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("calls")
      .select("*, request:help_requests(max_rate_per_minute)")
      .eq("id", callId)
      .single()
      .then(({ data }) => {
        if (data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rate = (data as any).request?.max_rate_per_minute ?? 1000;
          setRatePerMinute(rate);
        }
      });

    // Update call status to active
    supabase.from("calls").update({ status: "active", started_at: new Date().toISOString() }).eq("id", callId);
  }, [callId]);

  // Remote participant name
  useEffect(() => {
    const handleParticipantConnected = () => {
      const remote = Array.from(roomCtx.remoteParticipants.values())[0];
      if (remote?.name) setRemoteParticipantName(remote.name);
    };
    roomCtx.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    // Check existing
    const existing = Array.from(roomCtx.remoteParticipants.values())[0];
    if (existing?.name) setRemoteParticipantName(existing.name);
    return () => { roomCtx.off(RoomEvent.ParticipantConnected, handleParticipantConnected); };
  }, [roomCtx]);

  // Timer + billing
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((s) => {
        const next = s + 1;
        const cost = Math.floor((next / 60) * ratePerMinute);
        setCharged(cost);
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [ratePerMinute]);

  // Low balance check via Supabase
  useEffect(() => {
    const supabase = createClient();
    const interval = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("wallet_balance").eq("id", user.id).single();
      if (data) {
        const minutesLeft = data.wallet_balance / ratePerMinute;
        setLowBalance(minutesLeft < 1);
        if (minutesLeft <= 0) endCall();
      }
    }, 15000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratePerMinute]);

  const toggleMute = useCallback(async () => {
    await localParticipant.setMicrophoneEnabled(muted);
    setMuted(!muted);
  }, [localParticipant, muted]);

  const toggleScreenShare = useCallback(async () => {
    await localParticipant.setScreenShareEnabled(!screenShare);
    setScreenShare(!screenShare);
  }, [localParticipant, screenShare]);

  const endCall = useCallback(async () => {
    setEnding(true);
    const supabase = createClient();
    await supabase.from("calls").update({
      status: "ended",
      ended_at: new Date().toISOString(),
      duration_seconds: elapsed,
      total_charged: charged,
      expert_earned: Math.floor(charged * 0.8),
    }).eq("id", callId);
    await roomCtx.disconnect();
  }, [callId, charged, elapsed, roomCtx]);

  return (
    <div className="min-h-svh bg-black flex flex-col relative max-w-[430px] mx-auto">
      {/* Remote audio */}
      {tracks
        .filter((t) => !t.participant.isLocal)
        .map((t) => (
          <AudioTrack key={t.participant.identity} trackRef={t} />
        ))}

      {/* Video area */}
      <div className="flex-1 relative bg-gradient-to-br from-[#1a2030] to-[#0a1018] flex items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center gap-3">
          <Avatar name={remoteParticipantName} size="xl" />
          <span className="text-white text-xl font-bold">{remoteParticipantName}</span>
          {screenShare && (
            <span className="text-[var(--accent)] text-sm">🖥️ משתף מסך</span>
          )}
        </div>

        {/* Self PiP */}
        <div className="absolute top-4 left-4 w-24 h-32 bg-[#2a3040] rounded-xl border border-white/10 flex items-center justify-center text-[var(--text-tertiary)] text-xs">
          אתה
        </div>

        {/* Info bar */}
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-lg rounded-2xl px-3 py-2 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[var(--danger)] animate-pulse" />
          <span className="text-white font-bold tabular-nums">{formatDuration(elapsed)}</span>
          <span className="text-sm font-bold" style={{ color: lowBalance ? "var(--warning)" : "var(--accent)" }}>
            {formatILS(charged)}
          </span>
        </div>

        {/* Low balance warning */}
        {lowBalance && (
          <div className="absolute bottom-24 inset-x-4 bg-[rgba(255,170,0,0.15)] border border-[var(--warning)] backdrop-blur-lg rounded-xl p-3 text-center">
            <p className="text-[var(--warning)] text-sm font-bold mb-2">
              ⚠️ היתרה נמוכה — השיחה תסתיים בקרוב
            </p>
            <button
              onClick={() => router.push(`/wallet/topup?return=/call/${callId}`)}
              className="bg-[var(--warning)] text-black px-4 py-2 rounded-lg font-bold text-sm"
            >
              + הטען עכשיו
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black/90 backdrop-blur-xl px-6 py-4 pb-8 flex items-center justify-around gap-3">
        <button
          onClick={toggleMute}
          className="rounded-full flex items-center justify-center text-2xl transition-all"
          style={{
            width: 52, height: 52,
            background: muted ? "var(--accent)" : "rgba(255,255,255,0.1)",
            color: muted ? "#000" : "#fff",
          }}
        >
          {muted ? "🔇" : "🎤"}
        </button>

        <button
          className="rounded-full flex items-center justify-center text-2xl bg-white/10 text-white"
          style={{ width: 52, height: 52 }}
        >
          📹
        </button>

        <button
          onClick={toggleScreenShare}
          className="rounded-full flex items-center justify-center text-2xl transition-all"
          style={{
            width: 52, height: 52,
            background: screenShare ? "var(--accent)" : "rgba(255,255,255,0.1)",
            color: screenShare ? "#000" : "#fff",
          }}
        >
          🖥️
        </button>

        <button
          className="rounded-full flex items-center justify-center text-2xl bg-white/10 text-white"
          style={{ width: 52, height: 52 }}
        >
          💬
        </button>

        <button
          onClick={() => setShowEndConfirm(true)}
          className="rounded-full bg-[var(--danger)] text-white flex items-center justify-center text-2xl"
          style={{ width: 64, height: 64 }}
        >
          📞
        </button>
      </div>

      {/* End confirm */}
      {showEndConfirm && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-xs text-center">
            <h3 className="text-xl font-black mb-2">לסיים את השיחה?</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-6">
              תחויב על {formatDuration(elapsed)} דקות ({formatILS(charged)})
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowEndConfirm(false)}>ביטול</Button>
              <Button variant="danger" loading={ending} onClick={endCall}>סיים</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
