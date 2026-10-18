"use client";
import { RefObject, useEffect, useRef, useState } from "react";
export function useScrollVideo(sectionRef: RefObject<HTMLElement | null>, videoRef: RefObject<HTMLVideoElement | null>) {
  const [progress, setProgress] = useState(0); const [ready, setReady] = useState(false); const [failed, setFailed] = useState(false);
  const targetTime = useRef(0); const scrollRaf = useRef<number | null>(null); const seekRaf = useRef<number | null>(null); const seekPending = useRef(false);
  useEffect(() => {
    const section = sectionRef.current; const video = videoRef.current; if (!section || !video) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const applyLatestSeek = () => {
      seekRaf.current = null;
      if (reduceMotion || !Number.isFinite(video.duration) || video.duration <= 0) return;
      if (video.seeking) { seekPending.current = true; return; }
      const desired = Math.max(0, Math.min(video.duration - 0.04, targetTime.current));
      if (Math.abs(video.currentTime - desired) < 0.035) return;
      video.currentTime = desired;
    };
    const queueSeek = () => {
      if (video.seeking) { seekPending.current = true; return; }
      if (seekRaf.current === null) seekRaf.current = requestAnimationFrame(applyLatestSeek);
    };
    const onSeeked = () => {
      if (!seekPending.current) return;
      seekPending.current = false;
      queueSeek();
    };
    const onMetadata = () => { if (Number.isFinite(video.duration) && video.duration > 0) { setReady(true); targetTime.current = 0.01; queueSeek(); } };
    const onError = () => setFailed(true);
    const update = () => {
      if (scrollRaf.current !== null) return;
      scrollRaf.current = requestAnimationFrame(() => {
        scrollRaf.current = null;
        const rect = section.getBoundingClientRect(); const scrollable = Math.max(1, section.offsetHeight - window.innerHeight);
        const next = Math.min(1, Math.max(0, -rect.top / scrollable));
        setProgress((previous) => Math.abs(previous - next) > 0.003 ? next : previous);
        if (Number.isFinite(video.duration)) { targetTime.current = next * (video.duration - 0.05); queueSeek(); }
      });
    };
    video.addEventListener("loadedmetadata", onMetadata); video.addEventListener("seeked", onSeeked); video.addEventListener("error", onError);
    window.addEventListener("scroll", update, { passive: true }); window.addEventListener("resize", update);
    if (video.readyState >= 1) onMetadata(); update();
    return () => { video.removeEventListener("loadedmetadata", onMetadata); video.removeEventListener("seeked", onSeeked); video.removeEventListener("error", onError); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current); if (seekRaf.current) cancelAnimationFrame(seekRaf.current); };
  }, [sectionRef, videoRef]);
  return { progress, ready, failed };
}
