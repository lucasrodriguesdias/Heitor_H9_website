"use client";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { ScrollVideoSection } from "@/components/scroll-video-section";
import { BiographySection } from "@/components/biography-section";
import { PlayingStyleSection } from "@/components/playing-style-section";
import { HighlightsSection } from "@/components/highlights-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
export default function Home() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger); if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".hero .section-media img", { scale: 1.04 }, { scale: 1, duration: 1.6, ease: "power2.out" });
      gsap.from(".hero-content > *", { y: 32, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" });
      gsap.utils.toArray<HTMLElement>(".reveal-section").forEach((section) => gsap.from(section.querySelectorAll(".eyebrow, .section-title, .section-brush, .story-copy, .trait-card"), { y: 36, opacity: 0, duration: 0.8, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: section, start: "top 76%", once: true } }));
      gsap.utils.toArray<HTMLElement>(".media-section:not(.hero)").forEach((section) => { const image = section.querySelector(".section-media img"); if (image) gsap.fromTo(image, { yPercent: -2 }, { yPercent: 2, ease: "none", scrollTrigger: { trigger: section, scrub: true } }); });
    });
    return () => ctx.revert();
  }, []);
  return <><Header /><main><HeroSection /><ScrollVideoSection /><BiographySection /><PlayingStyleSection /><HighlightsSection /><ContactSection /></main><Footer /></>;
}
