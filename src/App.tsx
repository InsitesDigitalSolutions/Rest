import { useState, useEffect } from 'react';
import {
  Music,
  Sun,
  Moon,
  Maximize2,
  Heart,
  Share2,
  RefreshCw,
  Book,
  Check,
  Flame,
  Calendar,
  Activity,
  Award,
  BookOpen,
  Users,
  BarChart2,
  Clock,
  LogOut,
  ChevronRight,
  Menu,
  BookOpen as BookOpenIcon,
  MessageSquare,
  Sparkles,
  Headphones,
  Home,
  Plus,
  Shield,
  Compass,
  Feather,
  Crown,
  Milestone,
  Flag,
  Leaf,
  Waves,
  XCircle,
  ChevronDown,
  Search,
  Trash2,
  Pin,
  Star,
  CheckSquare,
  Square,
  X,
  Droplet
} from 'lucide-react';

import Splash from './components/Splash';
import AuthScreen from './components/AuthScreen';
import PrayerSession from './components/PrayerSession';
import FastingView from './components/FastingView';
import Dashboard from './components/Dashboard';
import FriendsView from './components/FriendsView';
import JournalView from './components/JournalView';
import PlanPicker from './components/PlanPicker';
import BibleReader from './components/BibleReader';
import FocusAudioPanel from './components/FocusAudioPanel';
import FocusRoom from './components/FocusRoom';
const themeConcepts = "/src/assets/images/rest_theme_concepts_1780260358356.png";

import {
  authAdapter,
  loadState,
  saveState,
  todayISO,
  buildPlan,
  recalcPlan,
  fmtDate,
  useFocusAudio,
  registerPWA,
  VOTD,
  PRAYER_WHEEL,
  PRAYER_LEVELS,
  MEDITATE_TOPICS,
  AUDIO_MANIFEST,
  PLAN_PRESETS,
  kjvVerse
} from './utils/kjv';

const PALETTES = [
  { name: "Monastery Gold", hex: "#C5A367", desc: "Devout and sacred" },
  { name: "Silent Sand", hex: "#D2B48C", desc: "Warm desert earth" },
  { name: "Monastic Sage", hex: "#8F9779", desc: "Dusk forest herbs" },
  { name: "Cathedral Blue", hex: "#6A819C", desc: "Peaceful vitrail sky" },
  { name: "Liturgy Red", hex: "#A15B5B", desc: "Crimson devotion" },
  { name: "Monk Violet", hex: "#7E6285", desc: "Quiet prayer hour" },
  { name: "Olive Grove", hex: "#838258", desc: "Gethsemane stillness" },
  { name: "Abbey Amber", hex: "#D9905B", desc: "Stained glass glow" },
  { name: "Sanctuary Stone", hex: "#9DA3A6", desc: "Weathered granite" },
  { name: "Mount Sinai Teal", hex: "#4F8182", desc: "Quiet high seas" },
  { name: "Morning Manna", hex: "#E3CFA8", desc: "Light grain warmth" },
  { name: "Rose of Sharon", hex: "#DCAEBC", desc: "Soft Rose of Sharon" },
  { name: "Deep Cedar", hex: "#8E7055", desc: "Ancient wood logs" },
  { name: "Chapel Bronze", hex: "#CD7F32", desc: "Sacred bell patina" },
  { name: "Sabbath Copper", hex: "#B87333", desc: "Warm metallic glow" },
  { name: "Jordan River Green", hex: "#779E89", desc: "Cool flowing waters" },
  { name: "Wild Honey", hex: "#C89D3C", desc: "Sustenance of the desert" },
  { name: "Divine Lavender", hex: "#A39BCB", desc: "Uplifting soft light" },
  { name: "Vesper Pitch", hex: "#636E72", desc: "Evening contemplation" },
  { name: "Sacred Clay", hex: "#C18C7E", desc: "Earthen vessels of faith" }
];

const BACKDROPS = [
  { id: "plain_ambient", name: "Plain Minimal Accent", desc: "A clean plain background showing your selected Color Accent as a soft glowing halo at the top of the screen" },
  { id: "mountain_sunrise", name: "Mountain Sunrise Sanctuary", desc: "Option 1: Pines & mountain peaks covered in fog and golden sunrise light" },
  { id: "deep_ocean", name: "Deep Ocean Stillness", desc: "Option 2: Deep blue marine sanctuary with silent underwater teal rays" },
  { id: "throne_light", name: "Throne Room Light", desc: "Option 3: Radiant sacred golden rays and halos glowing with divine awe" },
  { id: "cedars_lebanon", name: "Cedars of Lebanon", desc: "Option 4: Towering evergreen foliage bathed in gold beams of Sabbath light" },
  { id: "sinai_ascent", name: "Sinai Ascent", desc: "Option 5: Stretching desert sands and glowing peaks where the law was written" },
  { id: "evening_vespers", name: "Evening Vespers", desc: "Option 6: Cool gothic arches backlit by warm lavender and amber candle glow" },
  { id: "tabor_glory", name: "Tabor Glory", desc: "Option 7: High, luminous celestial cloudscapes illustrating the Transfiguration" },
  { id: "gethsemane_olive", name: "Gethsemane Olive Trees", desc: "Option 8: Cool, dew-laden shelter of ancient olive trees in twilight prayer" },
  { id: "patmos_eclipse", name: "Patmos Eclipse", desc: "Option 9: Infinite deep navy sky split open with holy revelation and stardust" },
  { id: "galilee_mist", name: "Galilee Mist", desc: "Option 10: Glassy, mirroring early morning mist over a tranquil sacred lake" },
  { id: "sharon_rose", name: "Rose of Sharon Meadow", desc: "Option 11: Spring valley fields alive with morning dew and soft coral highlights" },
  { id: "golden_altar", name: "Golden Altar Lights", desc: "Option 12: Continuous soft columns of warm golden incense and candlelight" },
  { id: "sabbath_rest", name: "Sabbath Pinewood Sanctuary", desc: "Option 13: Filter out any earthly noise under a canopy of ancient quiet pines" },
  { id: "eden_fountain", name: "Eden Living Fountain", desc: "Option 14: Pure, cool living water splashing on misty moss stones" },
  { id: "pneumas_breath", name: "Pneuma's Gentle Breath", desc: "Option 15: Silent grassy hills with low-rolling morning mist" },
  { id: "glorious_ascent", name: "Glorious Peak Sunrise", desc: "Option 16: Sun-pierced gold peaks rises above low clouds and canyons" },
  { id: "stellar_sanctuary", name: "Stellar Sanctuary Stars", desc: "Option 17: Nebula dust and radiant purple nebulae praising the Creator" },
  { id: "silicon_valley_vespers", name: "Silicon Slate Sanctuary", desc: "Option 18: Silver geometric lines and pure lights on an endless quiet grey void" },
  { id: "sinai", name: "Classic Sanctuary", desc: "A soft, elegant top-centered golden glow" },
  { id: "chapel", name: "Divine Cathedral", desc: "Double high-mounted soft gold halos" },
  { id: "gethsemane", name: "Sabbath Grace", desc: "A highly pronounced, radiant template gold aura" },
  { id: "jordan", name: "Morning Dawn", desc: "A wide, horizontal warm peach-and-gold glow" },
  { id: "hermon", name: "Deep Midnight", desc: "A very subtle, deep dim ambient indigo and gold highlight" },
  { id: "patmos", name: "Sacred Fire", desc: "A warm amber-gold, widely diffuse glowing hearth" },
  { id: "galilee", name: "Ethereal Peace", desc: "A soft template gold and lavender cosmic top glow pairing" },
  { id: "abbey", name: "Quiet Woods", desc: "A soft gold and mystic deep forest emerald haze" },
  { id: "wilderness", name: "Living Waters", desc: "A template gold and serene aquatic teal misty halo" },
  { id: "nebo", name: "Infinity Realm", desc: "Concentric dual-layer fuzzy deep gold corona glows" }
];

function renderGlowAmbience(backdropId: string, gold: string) {
  switch (backdropId) {
    case "plain_ambient":
      return (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <div style={{
            position: "absolute",
            top: "-30%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "160%",
            height: "90%",
            background: `radial-gradient(ellipse at 50% 0%, ${gold}44 0%, ${gold}18 45%, ${gold}03 75%, transparent 100%)`,
            filter: "blur(35px)",
            zIndex: 1,
            animation: "breathe 10s infinite ease-in-out"
          }} />
        </div>
      );
    case "mountain_sunrise":
      return (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, rgba(5, 5, 5, 0.4) 0%, rgba(5, 5, 5, 0.82) 100%), url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.65) contrast(1.1)",
            zIndex: 0
          }} />
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, transparent 30%, rgba(197, 163, 103, 0.08) 60%, rgba(5, 5, 5, 0.96) 100%)",
            mixBlendMode: "screen" as any,
            zIndex: 1
          }} />
          <div style={{
            position: "absolute",
            top: "-15%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "140%",
            height: "80%",
            background: `radial-gradient(circle at 50% 10%, ${gold}40 0%, ${gold}1a 45%, transparent 70%)`,
            filter: "blur(35px)",
            zIndex: 2,
            animation: "breathe 8s infinite ease-in-out"
          }} />
        </div>
      );
    case "deep_ocean":
      return (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, rgba(3, 12, 19, 0.5) 0%, rgba(2, 6, 10, 0.94) 100%), url("https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1600&q=80")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.5) saturate(0.8) contrast(1.05)",
            zIndex: 0
          }} />
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(62, 146, 163, 0.12) 0%, transparent 60%)",
            mixBlendMode: "screen" as any,
            zIndex: 1
          }} />
          <div style={{
            position: "absolute",
            top: "-30%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "160%",
            height: "90%",
            background: "radial-gradient(ellipse at 50% 0%, rgba(78, 212, 198, 0.22) 0%, rgba(62, 146, 163, 0.08) 40%, transparent 75%)",
            filter: "blur(30px)",
            zIndex: 2,
            animation: "breathe 10s infinite ease-in-out"
          }} />
        </div>
      );
    case "throne_light":
      return (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, rgba(5, 5, 8, 0.45) 0%, rgba(3, 3, 5, 0.95) 100%), url("https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=1600&q=80")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.4) contrast(1.1) hue-rotate(5deg)",
            zIndex: 0
          }} />
          <div style={{
            position: "absolute",
            top: "-40%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "120%",
            height: "100%",
            background: `radial-gradient(ellipse at 50% 0%, rgba(243, 229, 171, 0.35) 0%, rgba(229, 193, 88, 0.12) 40%, rgba(229, 193, 88, 0.03) 65%, transparent 80%)`,
            filter: "blur(24px)",
            zIndex: 1,
            animation: "breathe 7s infinite ease-in-out"
          }} />
          <div style={{
            position: "absolute",
            top: "-10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "70%",
            height: "60%",
            background: `radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.14) 0%, rgba(243, 229, 171, 0.04) 50%, transparent 80%)`,
            filter: "blur(18px)",
            zIndex: 2
          }} />
        </div>
      );
    case "cedars_lebanon":
      return (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, rgba(5, 12, 6, 0.45) 0%, rgba(3, 8, 4, 0.94) 100%), url("https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1600&q=80")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.55) contrast(1.1)",
            zIndex: 0
          }} />
          <div style={{
            position: "absolute",
            top: "-30%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "140%",
            height: "80%",
            background: `radial-gradient(circle at 50% 10%, ${gold}2f 0%, rgba(30, 130, 76, 0.1) 40%, transparent 75%)`,
            filter: "blur(40px)",
            zIndex: 2,
            animation: "breathe 10s infinite ease-in-out"
          }} />
        </div>
      );
    case "sinai_ascent":
      return (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, rgba(15, 6, 3, 0.35) 0%, rgba(8, 3, 1, 0.95) 100%), url("https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1600&q=80")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.6) contrast(1.15)",
            zIndex: 0
          }} />
          <div style={{
            position: "absolute",
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "150%",
            height: "80%",
            background: `radial-gradient(ellipse at 50% 0%, ${gold}40 0%, ${gold}15 45%, transparent 70%)`,
            filter: "blur(35px)",
            zIndex: 2,
            animation: "breathe 9s infinite ease-in-out"
          }} />
        </div>
      );
    case "evening_vespers":
      return (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, rgba(14, 5, 20, 0.5) 0%, rgba(5, 2, 8, 0.96) 100%), url("https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=80")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.4) saturate(0.9) contrast(1.1)",
            zIndex: 0
          }} />
          <div style={{
            position: "absolute",
            top: "-30%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "130%",
            height: "90%",
            background: `radial-gradient(circle at 50% 0%, rgba(142, 68, 173, 0.28) 0%, rgba(212, 172, 13, 0.1) 45%, transparent 75%)`,
            filter: "blur(32px)",
            zIndex: 2,
            animation: "breathe 11s infinite ease-in-out"
          }} />
        </div>
      );
    case "tabor_glory":
      return (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, rgba(20, 10, 10, 0.45) 0%, rgba(8, 3, 3, 0.96) 100%), url("https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1600&q=80")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.55) contrast(1.12)",
            zIndex: 0
          }} />
          <div style={{
            position: "absolute",
            top: "-35%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "150%",
            height: "95%",
            background: `radial-gradient(ellipse at 50% 10%, rgba(224, 90, 71, 0.3) 0%, ${gold}15 45%, transparent 80%)`,
            filter: "blur(36px)",
            zIndex: 2,
            animation: "breathe 8s infinite ease-in-out"
          }} />
        </div>
      );
    case "gethsemane_olive":
      return (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, rgba(4, 12, 8, 0.5) 0%, rgba(2, 6, 4, 0.96) 100%), url("https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1600&q=80")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.48) saturate(0.85)",
            zIndex: 0
          }} />
          <div style={{
            position: "absolute",
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "140%",
            height: "80%",
            background: `radial-gradient(circle at 50% 10%, rgba(88, 214, 141, 0.22) 0%, rgba(197, 163, 103, 0.08) 45%, transparent 75%)`,
            filter: "blur(30px)",
            zIndex: 2,
            animation: "breathe 10s infinite ease-in-out"
          }} />
        </div>
      );
    case "patmos_eclipse":
      return (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, rgba(5, 5, 12, 0.45) 0%, rgba(2, 2, 6, 0.96) 100%), url("https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1600&q=80")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.5) contrast(1.15)",
            zIndex: 0
          }} />
          <div style={{
            position: "absolute",
            top: "-15%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "130%",
            height: "75%",
            background: `radial-gradient(circle at 50% 0%, ${gold}35 0%, rgba(241, 196, 15, 0.15) 30%, transparent 70%)`,
            filter: "blur(28px)",
            zIndex: 2,
            animation: "breathe 12s infinite ease-in-out"
          }} />
        </div>
      );
    case "galilee_mist":
      return (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, rgba(5, 12, 18, 0.4) 0%, rgba(2, 5, 8, 0.94) 100%), url("https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.55) saturate(0.9) contrast(1.05)",
            zIndex: 0
          }} />
          <div style={{
            position: "absolute",
            top: "-30%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "150%",
            height: "90%",
            background: `radial-gradient(ellipse at 50% 0%, rgba(52, 152, 219, 0.22) 0%, ${gold}10 40%, transparent 75%)`,
            filter: "blur(32px)",
            zIndex: 2,
            animation: "breathe 10s infinite ease-in-out"
          }} />
        </div>
      );
    case "sharon_rose":
      return (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, rgba(16, 8, 8, 0.45) 0%, rgba(8, 3, 3, 0.95) 100%), url("https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.55) contrast(1.1)",
            zIndex: 0
          }} />
          <div style={{
            position: "absolute",
            top: "-25%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "140%",
            height: "80%",
            background: `radial-gradient(circle at 50% 10%, rgba(236, 112, 99, 0.25) 0%, ${gold}15 40%, transparent 75%)`,
            filter: "blur(35px)",
            zIndex: 2,
            animation: "breathe 8s infinite ease-in-out"
          }} />
        </div>
      );
    case "golden_altar":
      return (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, rgba(12, 10, 5, 0.5) 0%, rgba(6, 4, 1, 0.96) 100%), url("https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1600&q=80")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.45) contrast(1.12) sepia(0.2)",
            zIndex: 0
          }} />
          <div style={{
            position: "absolute",
            top: "-40%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "120%",
            height: "100%",
            background: `radial-gradient(ellipse at 50% 0%, rgba(212, 172, 13, 0.32) 0%, ${gold}15 50%, transparent 80%)`,
            filter: "blur(24px)",
            zIndex: 2,
            animation: "breathe 7s infinite ease-in-out"
          }} />
        </div>
      );
    case "sabbath_rest":
      return (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, rgba(4, 10, 6, 0.45) 0%, rgba(2, 5, 3, 0.95) 100%), url("https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.55) contrast(1.1)",
            zIndex: 0
          }} />
          <div style={{
            position: "absolute",
            top: "-30%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "150%",
            height: "85%",
            background: `radial-gradient(circle at 50% 10%, rgba(39, 174, 96, 0.22) 0%, ${gold}12 40%, transparent 75%)`,
            filter: "blur(32px)",
            zIndex: 2,
            animation: "breathe 9s infinite ease-in-out"
          }} />
        </div>
      );
    case "eden_fountain":
      return (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, rgba(4, 12, 12, 0.42) 0%, rgba(2, 6, 6, 0.94) 100%), url("https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1600&q=80")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.52) saturate(0.85) contrast(1.08)",
            zIndex: 0
          }} />
          <div style={{
            position: "absolute",
            top: "-25%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "140%",
            height: "80%",
            background: `radial-gradient(circle at 50% 10%, rgba(26, 188, 156, 0.22) 0%, ${gold}12 45%, transparent 75%)`,
            filter: "blur(30px)",
            zIndex: 2,
            animation: "breathe 10s infinite ease-in-out"
          }} />
        </div>
      );
    case "pneumas_breath":
      return (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, rgba(5, 10, 8, 0.42) 0%, rgba(2, 5, 4, 0.94) 100%), url("https://images.unsplash.com/photo-1472214222541-d510753a8707?auto=format&fit=crop&w=1600&q=80")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.58) saturate(0.8) contrast(1.05)",
            zIndex: 0
          }} />
          <div style={{
            position: "absolute",
            top: "-30%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "155%",
            height: "90%",
            background: `radial-gradient(ellipse at 50% 0%, rgba(162, 217, 206, 0.22) 0%, ${gold}12 40%, transparent 75%)`,
            filter: "blur(32px)",
            zIndex: 2,
            animation: "breathe 11s infinite ease-in-out"
          }} />
        </div>
      );
    case "glorious_ascent":
      return (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, rgba(16, 10, 5, 0.4) 0%, rgba(8, 5, 2, 0.95) 100%), url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.6) contrast(1.12)",
            zIndex: 0
          }} />
          <div style={{
            position: "absolute",
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "140%",
            height: "80%",
            background: `radial-gradient(circle at 50% 10%, rgba(230, 126, 34, 0.26) 0%, ${gold}12 45%, transparent 75%)`,
            filter: "blur(35px)",
            zIndex: 2,
            animation: "breathe 8s infinite ease-in-out"
          }} />
        </div>
      );
    case "stellar_sanctuary":
      return (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, rgba(12, 5, 18, 0.45) 0%, rgba(4, 1, 8, 0.96) 100%), url("https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1600&q=80")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.5) contrast(1.18)",
            zIndex: 0
          }} />
          <div style={{
            position: "absolute",
            top: "-30%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "155%",
            height: "90%",
            background: `radial-gradient(ellipse at 50% 0%, rgba(155, 89, 182, 0.28) 0%, ${gold}15 45%, transparent 80%)`,
            filter: "blur(32px)",
            zIndex: 2,
            animation: "breathe 10s infinite ease-in-out"
          }} />
        </div>
      );
    case "silicon_valley_vespers":
      return (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, rgba(10, 10, 12, 0.5) 0%, rgba(4, 4, 6, 0.98) 100%), url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.4) saturate(0.2) contrast(1.1)",
            zIndex: 0
          }} />
          <div style={{
            position: "absolute",
            top: "-35%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "140%",
            height: "80%",
            background: `radial-gradient(circle at 50% 10%, rgba(149, 165, 166, 0.22) 0%, ${gold}12 40%, transparent 75%)`,
            filter: "blur(32px)",
            zIndex: 2,
            animation: "breathe 12s infinite ease-in-out"
          }} />
        </div>
      );
    case "chapel":
      return (
        <>
          <div style={{ position: "absolute", top: "-25%", left: "30%", transform: "translateX(-50%)", width: "100%", height: "80%", background: `radial-gradient(circle, ${gold}33 0%, transparent 70%)`, filter: "blur(40px)" }} />
          <div style={{ position: "absolute", top: "-25%", left: "70%", transform: "translateX(-50%)", width: "100%", height: "80%", background: `radial-gradient(circle, ${gold}33 0%, transparent 70%)`, filter: "blur(40px)" }} />
        </>
      );
    case "gethsemane":
      return (
        <div
          style={{
            position: "absolute",
            top: "-35%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "150%",
            height: "90%",
            background: `radial-gradient(ellipse at 50% 0%, ${gold}66 0%, ${gold}33 35%, ${gold}0D 65%, transparent 95%)`,
            filter: "blur(20px)"
          }}
        />
      );
    case "jordan":
      return (
        <>
          <div style={{ position: "absolute", top: "-40%", left: "50%", transform: "translateX(-50%)", width: "180%", height: "90%", background: `radial-gradient(ellipse at 50% 0%, ${gold}33 0%, ${gold}1E 50%, transparent 100%)`, filter: "blur(30px)" }} />
          <div style={{ position: "absolute", top: "-15%", left: "50%", transform: "translateX(-50%)", width: "150%", height: "40%", background: `radial-gradient(ellipse at 50% 0%, ${gold}2C 0%, transparent 70%)`, filter: "blur(15px)" }} />
        </>
      );
    case "hermon":
      return (
        <div
          style={{
            position: "absolute",
            top: "-30%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "140%",
            height: "70%",
            background: `radial-gradient(ellipse at 50% 0%, ${gold}33 0%, ${gold}18 45%, transparent 80%)`,
            filter: "blur(45px)"
          }}
        />
      );
    case "patmos":
      return (
        <div
          style={{
            position: "absolute",
            top: "-25%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "160%",
            height: "90%",
            background: `radial-gradient(ellipse at 50% 0%, ${gold}3A 0%, ${gold}24 40%, transparent 85%)`,
            filter: "blur(35px)"
          }}
        />
      );
    case "galilee":
      return (
        <>
          <div style={{ position: "absolute", top: "-30%", left: "45%", transform: "translateX(-50%)", width: "135%", height: "80%", background: `radial-gradient(circle, ${gold}2A 0%, transparent 75%)`, filter: "blur(30px)" }} />
          <div style={{ position: "absolute", top: "-25%", left: "55%", transform: "translateX(-50%)", width: "135%", height: "80%", background: `radial-gradient(circle, ${gold}24 0%, transparent 75%)`, filter: "blur(30px)" }} />
        </>
      );
    case "abbey":
      return (
        <div
          style={{
            position: "absolute",
            top: "-30%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "155%",
            height: "85%",
            background: `radial-gradient(ellipse at 50% 0%, ${gold}2c 0%, ${gold}0F 40%, ${gold}04 70%, transparent 100%)`,
            filter: "blur(32px)"
          }}
        />
      );
    case "wilderness":
      return (
        <div
          style={{
            position: "absolute",
            top: "-30%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "150%",
            height: "80%",
            background: `radial-gradient(ellipse at 50% 0%, ${gold}2c 0%, ${gold}1A 40%, ${gold}04 70%, transparent 100%)`,
            filter: "blur(28px)"
          }}
        />
      );
    case "nebo":
      return (
        <>
          <div style={{ position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)", width: "130%", height: "70%", background: `radial-gradient(ellipse at 50% 0%, ${gold}4A 0%, transparent 55%)`, filter: "blur(40px)" }} />
          <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "160%", height: "95%", background: `radial-gradient(ellipse at 50% 0%, ${gold}24 30%, transparent 75%)`, filter: "blur(20px)", opacity: 0.7 }} />
        </>
      );
    case "sinai":
    default:
      return (
        <div
          style={{
            position: "absolute",
            top: "-30%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "160%",
            height: "90%",
            background: `radial-gradient(ellipse at 50% 0%, ${gold}3C 0%, ${gold}18 45%, ${gold}04 75%, transparent 100%)`,
            filter: "blur(35px)"
          }}
        />
      );
  }
}

const BRAND = "REST";
const TAGLINE = "Find Rest in Him";
const F_thin = "'Helvetica Neue Thin', 'Helvetica Neue-Thin', 'Helvetica Neue-Ultralight', 'Helvetica Neue Ultralight', 'Helvetica Neue', Arial, sans-serif";
const F = "'Helvetica Neue Light', 'Helvetica Neue-Light', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const C = {
  bg: "#0A0A0A",
  surface: "#121212",
  surface2: "#181818",
  gold: "#C5A367",
  goldGlow: "rgba(197, 163, 103, 0.15)",
  line: "rgba(255, 255, 255, 0.08)",
  muted: "rgba(255, 255, 255, 0.52)",
  faint: "rgba(255, 255, 255, 0.28)",
  text: "#FFFFFF"
};

const W = {
  thin: 100,
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700
};

const defaultPrayerItems = [
  {
    id: "p1",
    title: "Healing for Mom",
    type: "Prayer Requests",
    priority: "High",
    notes: "Pray for complete recovery, muscle strength, and peace of mind during her rehabilitation.",
    dateAdded: "2026-05-15",
    pinned: true,
    favorite: true,
    lastPrayedDate: "2026-05-30"
  },
  {
    id: "p2",
    title: "Financial Provision",
    type: "Ongoing Prayers",
    priority: "Medium",
    notes: "Wisdom for monthly budgeting, new business opportunities, and trust in His daily supply.",
    dateAdded: "2026-05-20",
    pinned: false,
    favorite: false,
    lastPrayedDate: "2026-05-29"
  },
  {
    id: "p3",
    title: "Unsaved Family Members",
    type: "Family Prayers",
    priority: "High",
    notes: "For hearts to soften and open to the grace and quiet of God's love.",
    dateAdded: "2026-05-18",
    pinned: true,
    favorite: true,
    lastPrayedDate: "2026-05-31"
  },
  {
    id: "p4",
    title: "Wisdom for Major Decision",
    type: "Prayer Requests",
    priority: "Medium",
    notes: "Discernment on next steps for career relocation and family sanctuary alignment.",
    dateAdded: "2026-05-25",
    pinned: false,
    favorite: false,
    lastPrayedDate: "2026-05-31"
  },
  {
    id: "p5",
    title: "Children",
    type: "Memorial Prayers",
    priority: "High",
    notes: "For spiritual protection, wisdom, and alignment with God's purpose daily.",
    dateAdded: "2026-05-01",
    pinned: true,
    favorite: false,
    lastPrayedDate: "2026-05-31"
  },
  {
    id: "p6",
    title: "Marriage",
    type: "Memorial Prayers",
    priority: "Medium",
    notes: "Cultivating mutual respect, shared devotion, and patient love daily.",
    dateAdded: "2026-05-01",
    pinned: false,
    favorite: true,
    lastPrayedDate: "2026-05-31"
  },
  {
    id: "p7",
    title: "Missions & Leadership",
    type: "Memorial Prayers",
    priority: "Low",
    notes: "Support and strength for those sharing God's rest across the nation.",
    dateAdded: "2026-05-01",
    pinned: false,
    favorite: false,
    lastPrayedDate: "2026-05-25"
  }
];

const PRAYER_MODES_LIST = [
  {
    id: "morning_consecration",
    title: "Morning Consecration",
    desc: "Begin your day by dedicating it to God and aligning your heart with His perfect will.",
    duration: "15–20 Mins",
    subject: "default",
    mode: "guided",
    disciplines: [
      "Worship & Adoration",
      "Surrender & Consecration",
      "Scripture Meditation",
      "Guided Prompt Response",
      "Personal Reflection"
    ],
    scriptures: ["James 4:8", "Psalms 5:3", "Romans 12:1"]
  },
  {
    id: "scripture_based",
    title: "Scripture-Based Prayer",
    desc: "Pray directly through selected scripture focus areas to feed your faith and trust in God's promises.",
    duration: "20–30 Mins",
    subject: "promises",
    mode: "guided",
    disciplines: [
      "Responsive Scripture Reading",
      "Word Meditation",
      "Faith declarations",
      "Reclaiming peaceful posture"
    ],
    scriptures: ["Psalms 119:105", "Isaiah 55:11", "Hebrews 4:12"]
  },
  {
    id: "intercessory",
    title: "Intercessory Prayer",
    desc: "Stand in the gap for family, friends, communities, church leadership, and missionary works.",
    duration: "20–30 Mins",
    subject: "prayer",
    mode: "guided",
    disciplines: [
      "Lifting global burdens",
      "Targeted prayer requests alignment",
      "Selfless petitioning",
      "Intercession focus list"
    ],
    scriptures: ["1 Timothy 2:1", "Ephesians 6:18", "James 5:16"]
  },
  {
    id: "confession_renewal",
    title: "Confession & Renewal",
    desc: "Soberly examine your heart, repent of shortcomings, and receive the beautiful comfort of His forgiveness.",
    duration: "10–15 Mins",
    subject: "forgive",
    mode: "guided",
    disciplines: [
      "Self-examination",
      "Repentance with quiet humility",
      "Receiving grace assurance",
      "Restored conscience peace"
    ],
    scriptures: ["1 John 1:9", "Psalms 51:10", "Proverbs 28:13"]
  },
  {
    id: "gratitude_praise",
    title: "Gratitude & Praise",
    desc: "Shift your complete focus to God's ultimate goodness and declare appreciation for His faithful guidance.",
    duration: "10–15 Mins",
    subject: "joy",
    mode: "guided",
    disciplines: [
      "Joyful thanksgiving",
      "Listing answered prayers",
      "Praise and majesty declarations",
      "Spirit renewal"
    ],
    scriptures: ["Psalms 100:4", "1 Thessalonians 5:18", "Psalms 103:2"]
  },
  {
    id: "evening_reflection",
    title: "Evening Reflection",
    desc: "Surrender the weight and speed of the day to enter His restorative, quiet, and sacred night rest.",
    duration: "15–20 Mins",
    subject: "rest",
    mode: "guided",
    disciplines: [
      "Releasing day worries",
      "Evening gratitude",
      "Peace reassurance",
      "Restful sleep preparation"
    ],
    scriptures: ["Psalms 4:8", "Matthew 11:28", "Proverbs 3:24"]
  },
  {
    id: "spiritual_warfare",
    title: "Spiritual Warfare",
    desc: "Put on the whole armor of God, stand firm against fear or negative influence, and reclaim divine peace.",
    duration: "30 Mins",
    subject: "protection",
    mode: "guided",
    disciplines: [
      "Armor declaration",
      "Breaking strongholds of fear",
      "Declaring victory",
      "Boundless shielding trust"
    ],
    scriptures: ["Ephesians 6:11", "2 Corinthians 10:4", "James 4:7"]
  },
  {
    id: "healing_prayer",
    title: "Healing Prayer",
    desc: "Bring physical ailments, emotional hurts, and anxious stresses before the ultimate Healer.",
    duration: "15 Mins",
    subject: "healing",
    mode: "guided",
    disciplines: [
      "Physical and soul renewal focus",
      "Laying down heavy weights",
      "Commanding peace to bodies",
      "Surrender to divine timing"
    ],
    scriptures: ["James 5:15", "Psalms 103:3", "Jeremiah 17:14"]
  },
  {
    id: "family_prayer",
    title: "Family Prayer",
    desc: "Intercede for home peace, marriage oneness, sibling harmony, and ancestral spiritual protection.",
    duration: "10 Mins",
    subject: "salvation",
    mode: "guided",
    disciplines: [
      "Household consecration",
      "Generational blessing",
      "Spousal and child armor",
      "Unity restoration"
    ],
    scriptures: ["Joshua 24:15", "Acts 16:31", "Psalms 127:1"]
  },
  {
    id: "open_prayer",
    title: "Open Prayer Session",
    desc: "Deep, unhurried, intimate conversation with God with self-guided progression and no timers.",
    duration: "Unlimited",
    subject: "default",
    mode: "open",
    disciplines: [
      "Unhurried communion",
      "Silent listening focus",
      "Pouring out the heart",
      "Personal devotion framework"
    ],
    scriptures: ["Philippians 4:6", "Psalms 62:8", "Jeremiah 29:12"]
  }
];

export default function App() {
  const [booted, setBooted] = useState(false);
  const [user, setUser] = useState(() => authAdapter.current());
  const [state, setState] = useState(() => loadState());
  const [dark, setDark] = useState(() => state.settings?.dark !== false);
  const backdropId = state.settings?.backdropId || "sinai";
  const activeThemeColor = state.settings?.themeColor || (
    backdropId === "deep_ocean" ? "#3E92A3" :
    backdropId === "throne_light" ? "#E5C269" :
    backdropId === "cedars_lebanon" ? "#1E824C" :
    backdropId === "sinai_ascent" ? "#D35400" :
    backdropId === "evening_vespers" ? "#8E44AD" :
    backdropId === "tabor_glory" ? "#E05A47" :
    backdropId === "gethsemane_olive" ? "#58D68D" :
    backdropId === "patmos_eclipse" ? "#F1C40F" :
    backdropId === "galilee_mist" ? "#3498DB" :
    backdropId === "sharon_rose" ? "#EC7063" :
    backdropId === "golden_altar" ? "#D4AC0D" :
    backdropId === "sabbath_rest" ? "#27AE60" :
    backdropId === "eden_fountain" ? "#1ABC9C" :
    backdropId === "pneumas_breath" ? "#A2D9CE" :
    backdropId === "glorious_ascent" ? "#E67E22" :
    backdropId === "stellar_sanctuary" ? "#9B59B6" :
    backdropId === "silicon_valley_vespers" ? "#95A5A6" : "#C5A367"
  );
  const C = {
    bg: dark ? "#0A0A0A" : "#F5F3ED",
    surface: dark ? "rgba(18, 18, 18, 0.45)" : "rgba(255, 255, 255, 0.7)",
    surface2: dark ? "rgba(24, 24, 24, 0.45)" : "rgba(248, 248, 248, 0.7)",
    gold: activeThemeColor,
    goldGlow: `${activeThemeColor}26`,
    line: dark ? "rgba(255, 255, 255, 0.08)" : "rgba(28, 26, 22, 0.12)",
    muted: dark ? "rgba(255, 255, 255, 0.52)" : "#7A756B",
    faint: dark ? "rgba(255, 255, 255, 0.28)" : "rgba(28, 26, 22, 0.06)",
    text: dark ? "#FFFFFF" : "#1C1A16"
  };
  const [tab, setTab] = useState<"home" | "plan" | "prayer" | "meditate" | "friends" | "dashboard" | "fasting" | "journal" | "profile">("home");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const audio = useFocusAudio();

  // Redesigned Prayer module custom states
  const [selectedPreviewMode, setSelectedPreviewMode] = useState<any | null>(null);
  const [prayerSubTab, setPrayerSubTab] = useState<"dashboard" | "modes" | "list">("dashboard");
  const [prayerList, setPrayerList] = useState<any[]>(() => {
    const saved = localStorage.getItem("rest_prayer_items_v2");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        // use default fallback
      }
    }
    return defaultPrayerItems;
  });
  
  // Save prayer list whenever it changes
  useEffect(() => {
    localStorage.setItem("rest_prayer_items_v2", JSON.stringify(prayerList));
  }, [prayerList]);
  
  const [prayerListTab, setPrayerListTab] = useState<"all" | "memorial" | "ongoing" | "answered">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newPrayerTitle, setNewPrayerTitle] = useState("");
  const [newPrayerType, setNewPrayerType] = useState("Prayer Requests");
  const [newPrayerPriority, setNewPrayerPriority] = useState("Medium");
  const [newPrayerNotes, setNewPrayerNotes] = useState("");
  const [showAddPrayerForm, setShowAddPrayerForm] = useState(false);

  // Overlays
  const [reader, setReader] = useState<any | null>(null); // {chapters, dayNum, autoPlay}
  const [prayer, setPrayer] = useState<any | null>(null); // {startStep}
  const prayerStyle = "symmetrical";
  const [prayerSubject, setPrayerSubject] = useState<string>("default");
  const [prayerMode, setPrayerMode] = useState<"guided" | "recharge" | "open">("guided");
  const [confirmAbort, setConfirmAbort] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [showPlanPick, setShowPlanPick] = useState(false);
  const [votdText, setVotdText] = useState<{ text: string; ref: string } | null>(null);
  const [showFocusPrompt, setShowFocusPrompt] = useState(false);
  const [inFocusMode, setInFocusMode] = useState(false);
  const [focusSessionType, setFocusSessionType] = useState<"plan" | "promises" | "chapter">("promises");
  const [focusTopicIdx, setFocusTopicIdx] = useState<number>(0);
  const [dndAcknowledged, setDndAcknowledged] = useState(() => localStorage.getItem("rest_dnd_acknowledged") === "true");
  const [sweepActive, setSweepActive] = useState(false);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    registerPWA();
    // Load VOTD on load
    const v = VOTD[new Date().getDate() % VOTD.length];
    kjvVerse(v.book, v.chapter, v.verse).then(t => {
      setVotdText({ text: t || "…", ref: v.ref });
    });
  }, []);

  useEffect(() => {
    setState((s: any) => ({
      ...s,
      settings: { ...(s.settings || {}), dark }
    }));
  }, [dark]);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  };

  const handleSaveVerse = (text: string, reference: string) => {
    if (!text) return;
    setState((s: any) => ({
      ...s,
      savedVerses: [
        { text, ref: reference, ts: Date.now() },
        ...(s.savedVerses || []).filter((v: any) => v.ref !== reference)
      ]
    }));
    showToast("Verse saved to favorites");
  };

  // Derived plan variables
  const plan = (() => {
    const p = state.plan;
    if (!p || !p.list || p.list.length === 0) return null;
    if (!p.list[0].chapters || p.list[0].chapters.length === 0) {
      const rebuilt = buildPlan(p.scope || "all", p.days || 365, p.startDate || todayISO());
      return {
        ...p,
        list: p.list.map((e: any, i: number) => ({
          ...e,
          chapters: rebuilt[i]?.chapters || []
        }))
      };
    }
    return p;
  })();

  const completed = state.completed || {};
  const completedCount = Object.keys(completed).length;
  const todayIdx = plan ? Math.max(0, plan.list.findIndex((d: any) => d.date === todayISO())) : 0;
  const todayEntry = plan ? plan.list[todayIdx] : null;

  const streak = (() => {
    if (!plan) return 0;
    let s = 0;
    for (let i = todayIdx; i >= 0; i--) {
      if (completed[plan.list[i]?.day]) {
        s++;
      } else {
        break;
      }
    }
    return s;
  })();

  const pct = plan && plan.list.length ? Math.round((completedCount / plan.list.length) * 100) : 0;
  const missed = plan ? plan.list.slice(0, todayIdx).filter((d: any) => !completed[d.day]) : [];

  // Prayer data
  const prayerData = state.prayer || { sessions: [], level: 0 };
  const prayerSessions = prayerData.sessions || [];
  const prayerToday = prayerSessions.filter((s: any) => s.date === todayISO()).reduce((a: number, s: any) => a + s.secs, 0);

  const prayerStreak = (() => {
    let s = 0;
    let d = new Date();
    for (;;) {
      const iso = d.toISOString().split("T")[0];
      if (prayerSessions.some((x: any) => x.date === iso)) {
        s++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return s;
  })();

  const prayerLifetimeHrs = (prayerSessions.reduce((a: number, s: any) => a + s.secs, 0) / 3600).toFixed(1);
  const level = PRAYER_LEVELS[prayerData.level || 0];

  const choosePlan = (preset: any, customDays: number | null, customEndDate?: string) => {
    let days;
    if (customEndDate) {
      days = Math.max(1, Math.round((new Date(customEndDate).getTime() - new Date(todayISO()).getTime()) / 86400000) + 1);
    } else {
      days = preset.id === "custom" ? (customDays || 120) : preset.days;
    }
    const list = buildPlan(preset.scope, days, todayISO());
    const endDate = list[list.length - 1].date;
    setState((s: any) => ({
      ...s,
      plan: { presetId: preset.id, scope: preset.scope, days, startDate: todayISO(), endDate, list }
    }));
    setShowPlanPick(false);
    showToast(`${preset.name} plan started`);
  };

  const abortPlan = () => {
    setState((s: any) => ({ ...s, plan: null }));
    setConfirmAbort(false);
    setShowPlanPick(true);
    showToast("Plan stopped. Your records are kept safe.");
  };

  const markComplete = (dayNum: number) => {
    setState((s: any) => {
      const c = { ...(s.completed || {}) };
      if (c[dayNum]) {
        delete c[dayNum];
      } else {
        c[dayNum] = Date.now();
      }
      return { ...s, completed: c };
    });
  };

  const recalc = () => {
    if (!plan) return;
    const np = recalcPlan(plan.scope, Object.keys(completed).map(Number), plan.list, plan.endDate);
    if (!np.length) {
      showToast("Nothing to recalculate");
      return;
    }
    // Set active sweep transition feedback
    setSweepActive(true);
    setTimeout(() => {
      setSweepActive(false);
    }, 1200);

    setState((s: any) => ({
      ...s,
      plan: { ...s.plan, list: np }
    }));
    showToast("Your reading plan has been updated to keep you on track. Daily allocation adjusted.");
  };

  const logPrayer = (secs: number) => {
    if (secs < 5) return;
    setState((s: any) => {
      const p = s.prayer || { sessions: [], level: 0 };
      const sessions = [{ date: todayISO(), secs, ts: Date.now() }, ...(p.sessions || [])];

      // Auto check level thresholds
      let lvl = p.level || 0;
      const todayTotalSec = sessions.filter((x: any) => x.date === todayISO()).reduce((sum: number, x: any) => sum + x.secs, 0);
      const nextLevel = PRAYER_LEVELS[lvl + 1];
      if (nextLevel && todayTotalSec >= nextLevel.minutes * 60) {
        lvl = lvl + 1;
      }
      return {
        ...s,
        prayer: { ...p, sessions, level: lvl }
      };
    });
    showToast("Prayer session logged successfully!");
  };

  const addJournal = (type: string, text: string) => {
    if (!text.trim()) return;
    setState((s: any) => ({
      ...s,
      journal: [{ id: Date.now(), type, text, date: todayISO() }, ...(s.journal || [])]
    }));
    showToast("Journal entry saved");
  };

  const saveVotdVerse = () => {
    if (votdText) {
      handleSaveVerse(votdText.text, votdText.ref);
    }
  };

  const shareVerse = () => {
    if (!votdText) return;
    const t = `"${votdText.text}" — ${votdText.ref} (KJV)`;
    if (navigator.share) {
      navigator.share({ text: t }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(t);
      showToast("Verse text copied to clipboard");
    }
  };

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    } catch {}
  };

  // Guard loading views
  if (!booted) {
    return <Splash onDone={() => setBooted(true)} />;
  }

  // Guard Do Not Disturb acknowledgement
  if (!dndAcknowledged) {
    return (
      <div
        id="dnd-acknowledge-screen"
        style={{
          minHeight: "100vh",
          background: "#0A0A0A",
          color: "#FFFFFF",
          fontFamily: F,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          textAlign: "center"
        }}
      >
        <div style={{ maxWidth: 460, width: "100%" }}>
          <div style={{ fontFamily: F, fontSize: 44, fontWeight: 100, color: C.gold, letterSpacing: "0.2em", marginBottom: 24 }}>
            REST
          </div>
          <div style={{ width: 40, height: 1, background: C.gold, margin: "0 auto 32px" }} />
          
          <h2 style={{ fontSize: 24, fontWeight: 300, color: "#FFFFFF", marginBottom: 16, letterSpacing: "-0.01em" }}>
            Silence the World
          </h2>
          
          <p style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.6, marginBottom: 28 }}>
            Before entering this sanctuary of rest, we request that you silence your device and enable Do Not Disturb mode. Mute all alerts, notifications, and worldly interruptions to cultivate deep, undistracted communion with Him and find perfect peace.
          </p>

          <div 
            id="dnd-checkbox-container"
            style={{ 
              background: "#121212", 
              border: "1px solid rgba(197, 163, 103, 0.15)", 
              borderRadius: 16, 
              padding: 20, 
              marginBottom: 32,
              textAlign: "left"
            }}
          >
            <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
              <input 
                type="checkbox" 
                id="dnd-checkbox"
                style={{ marginTop: 3, accentColor: C.gold, width: 18, height: 18, cursor: "pointer" }}
              />
              <span style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.8)", lineHeight: 1.5 }}>
                I confirm my device is set to Do Not Disturb and all notifications have been silenced.
              </span>
            </label>
          </div>

          <button
            id="dnd-confirm-btn"
            onClick={() => {
              const check = document.getElementById("dnd-checkbox") as HTMLInputElement;
              if (check && check.checked) {
                localStorage.setItem("rest_dnd_acknowledged", "true");
                setDndAcknowledged(true);
              } else {
                setToast("Please acknowledge and check the box to enter");
              }
            }}
            style={{
              width: "100%",
              padding: "16px 20px",
              borderRadius: 12,
              background: C.gold,
              color: "#0A0A0A",
              border: "none",
              fontWeight: "600",
              fontFamily: F,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontSize: 12,
              cursor: "pointer"
            }}
          >
            Acknowledge and Enter
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthScreen
        onAuth={u => {
          setUser(u);
          const saved = loadState();
          if (!saved.plan) {
            setShowPlanPick(true);
          }
        }}
      />
    );
  }



  const bg = "transparent";
  const fg = dark ? C.text : "#1C1A16";
  const mut = dark ? C.muted : "#7A756B";
  const surf = dark ? "rgba(18, 18, 18, 0.45)" : "rgba(255, 255, 255, 0.7)";
  const surf2 = dark ? "rgba(24, 24, 24, 0.45)" : "rgba(248, 248, 248, 0.7)";
  const brd = dark ? C.line : "rgba(28, 26, 22, 0.12)";

  const cardStyle = {
    background: surf,
    backdropFilter: "blur(20px) saturate(125%)",
    WebkitBackdropFilter: "blur(20px) saturate(125%)",
    border: `1px solid ${brd}`,
    borderRadius: 18,
    padding: 20,
    transition: "all 0.2s"
  };

  const sectionLabelStyle = {
    color: mut,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
    marginBottom: 12,
    fontWeight: W.medium,
    fontFamily: F
  };

  const goldBtnStyle = () => ({
    display: "inline-flex" as const,
    alignItems: "center" as const,
    gap: 8,
    padding: "11px 18px",
    background: C.gold,
    border: "none",
    borderRadius: 10,
    color: dark ? C.bg : "#1C1A16",
    fontFamily: F,
    fontSize: 14,
    fontWeight: W.semibold,
    cursor: "pointer",
    transition: "all 0.2s"
  });

  const ghostBtnStyle = (borderClr: string, textClr: string) => ({
    display: "inline-flex" as const,
    alignItems: "center" as const,
    gap: 8,
    padding: "11px 18px",
    background: "transparent",
    border: `1px solid ${borderClr}`,
    borderRadius: 10,
    color: textClr,
    fontFamily: F,
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.2s"
  });

  const iconBtnStyle = (borderClr: string, iconClr: string) => ({
    background: "transparent",
    border: `1px solid ${borderClr}`,
    borderRadius: 10,
    padding: 9,
    cursor: "pointer",
    color: iconClr,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s"
  });

  if (inFocusMode) {
    return (
      <FocusRoom
        onClose={() => setInFocusMode(false)}
        audio={audio}
        todayEntry={todayEntry}
        showToast={showToast}
        initialSessionType={focusSessionType}
        initialPromiseTopicIdx={focusTopicIdx}
        dark={dark}
        C={C}
        F={F}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, color: fg, fontFamily: F, transition: "background 0.3s", paddingBottom: 110, position: "relative" }}>
      {/* Glow Ambience Backdrop Layer */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0, background: dark ? "#050505" : "#F5F3ED", transition: "background 0.3s" }}>
        {renderGlowAmbience(backdropId, C.gold)}
      </div>
      <style>{`
        :root {
          --theme-gold: ${activeThemeColor};
          --theme-gold-glow: ${activeThemeColor}26;
        }
        *{box-sizing:border-box}
        body{margin:0;background:${bg};transition:background 0.3s;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes breathe{0%,100%{opacity:0.6}50%{opacity:0.95}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        button:active{transform:scale(0.97)}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:${brd};border-radius:100px}
        input,textarea,select{outline:none}
        input:focus,textarea:focus{border-color:${C.gold}!important}
        a{color:${C.gold}}
        .scrolling-element::-webkit-scrollbar { display: none; }
        .rest-grid{display:grid;grid-template-columns:1fr;gap:18px}
        @media(min-width:640px){.rest-grid{grid-template-columns:1fr 1fr;}}
        @media(min-width:1024px){.rest-grid{grid-template-columns:1fr 1fr 1fr;}}
      `}</style>

      {/* Embedded toast system */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#16171C",
            border: `1px solid ${C.gold}44`,
            color: C.text,
            padding: "10px 18px",
            borderRadius: 30,
            fontSize: 13,
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            animation: "fadeUp 0.3s forwards"
          }}
        >
          <Sparkles size={14} style={{ color: C.gold }} />
          <span>{toast}</span>
        </div>
      )}

      {/* Active Overlays */}
      {showFocusPrompt && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 900,
            background: "rgba(10,10,10,0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            animation: "fadeUp 0.3s forwards"
          }}
          onClick={() => setShowFocusPrompt(false)}
        >
          <div
            style={{
              background: "#121212",
              border: `1px solid rgba(197, 163, 103, 0.3)`,
              boxShadow: "0 15px 45px rgba(0,0,0,0.7), 0 0 40px rgba(197, 163, 103, 0.05)",
              borderRadius: 24,
              padding: 32,
              maxWidth: 440,
              width: "100%",
              textAlign: "center"
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              style={{
                background: "rgba(197,163,103,0.1)",
                borderRadius: "50%",
                width: 60,
                height: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px"
              }}
            >
              <Sparkles size={24} style={{ color: C.gold }} />
            </div>

            <span 
              style={{ 
                textTransform: "uppercase", 
                letterSpacing: "0.2em", 
                fontSize: 10, 
                color: C.gold, 
                fontWeight: "600",
                display: "block",
                marginBottom: 4
              }}
            >
              SANCTUARY RECOMMENDATION
            </span>

            <h2 
              style={{ 
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', 
                fontSize: 26, 
                fontWeight: "300", 
                color: "#FFFFFF",
                marginBottom: 12,
                letterSpacing: "-0.01em"
              }}
            >
              Enter Focus Mode?
            </h2>

            <p 
              style={{ 
                fontSize: 13, 
                color: "rgba(255, 255, 255, 0.6)", 
                lineHeight: 1.6, 
                marginBottom: 24 
              }}
            >
              Step into an immersive, distraction-free quiet room. Stream custom meditative loops, select professional neural voice narrators, and follow focus silence guidance.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => {
                  setShowFocusPrompt(false);
                  setInFocusMode(true);
                }}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  borderRadius: 12,
                  background: C.gold,
                  color: "#0A0A0A",
                  border: "none",
                  fontWeight: "700",
                  fontFamily: F,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontSize: 12,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Enter Sanctuary
              </button>

              <button
                onClick={() => setShowFocusPrompt(false)}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  borderRadius: 12,
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "rgba(255, 255, 255, 0.52)",
                  fontWeight: "500",
                  fontFamily: F,
                  fontSize: 12,
                  cursor: "pointer",
                  transition: "color 0.2s"
                }}
              >
                Skip, show dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {reader && (
        <BibleReader
          chapters={reader.chapters || []}
          startAutoPlay={!!reader.autoPlay}
          onClose={() => setReader(null)}
          onAudioDuck={audio.duck}
          onComplete={
            reader.dayNum
              ? () => {
                  markComplete(reader.dayNum);
                  setReader(null);
                  showToast("Bible chapter marked as completed");
                }
              : undefined
          }
        />
      )}

      {prayer && (
        <PrayerSession
          startStep={prayer.startStep}
          styleMode={prayer.style || "symmetrical"}
          subjectId={prayer.subject || "default"}
          prayerMode={prayer.mode || "guided"}
          durations={state.prayerDurations}
          audio={audio}
          onLog={logPrayer}
          onClose={() => setPrayer(null)}
          onSaveVerse={handleSaveVerse}
        />
      )}

      {showAudio && (
        <FocusAudioPanel
          audio={audio}
          onClose={() => setShowAudio(false)}
          dark={dark}
        />
      )}

      {showPlanPick && (
        <PlanPicker
          dark={dark}
          onChoose={choosePlan}
          onClose={plan ? () => setShowPlanPick(false) : null}
        />
      )}

      {confirmAbort && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 700,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20
          }}
          onClick={() => setConfirmAbort(false)}
        >
          <div
            style={{
              background: surf,
              border: `1px solid ${brd}`,
              borderRadius: 18,
              padding: 26,
              maxWidth: 360,
              width: "100%"
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 17, fontWeight: W.medium, marginBottom: 8, color: fg }}>End this plan?</div>
            <div style={{ fontSize: 13, color: mut, lineHeight: 1.6, marginBottom: 20 }}>
              Your completed days and achievements are kept safe. You can start a new plan afterwards.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={abortPlan} style={{ ...goldBtnStyle(), flex: 1, justifyContent: "center" }}>
                End Plan
              </button>
              <button onClick={() => setConfirmAbort(false)} style={{ ...ghostBtnStyle(brd, fg), flex: 1, justifyContent: "center" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Top Header bar */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "20px 20px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div>
          <div style={{ fontSize: 28, fontWeight: "100", color: C.gold, letterSpacing: "0.15em", fontFamily: F_thin }}>
            {BRAND.toUpperCase()}
          </div>
          <div style={{ fontSize: 10, fontWeight: W.light, color: mut, textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 2 }}>
            {TAGLINE}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => {
              const t = AUDIO_MANIFEST.find(a => a.id === "track1");
              if (t) {
                audio.track ? audio.toggle() : audio.play(t);
              }
            }}
            style={iconBtnStyle(brd, audio.playing ? C.gold : mut)}
            title="Focus audio"
          >
            <Music size={15} />
          </button>
          <button onClick={() => setDark(d => !d)} style={iconBtnStyle(brd, mut)} title="Theme">
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button onClick={toggleFullscreen} style={iconBtnStyle(brd, mut)} title="Fullscreen">
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      {/* Main responsive grid view area */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 20px" }}>
        
        {/* HOMEPAGE VIEW */}
        {tab === "home" && (
          <div style={{ animation: "fadeUp 0.3s forwards", maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
            
            {/* App brand header mimicking the screenshot */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 28, letterSpacing: 8, textTransform: "uppercase", color: C.gold, fontWeight: "100", fontFamily: F_thin }}>
                {BRAND}
              </div>
              <div style={{ fontSize: 13, fontWeight: "300", color: mut, letterSpacing: "0.05em", marginTop: 4, fontFamily: F }}>
                {TAGLINE}
              </div>
              <div style={{ height: 1, width: 32, background: `${C.gold}44`, marginTop: 12 }} />
            </div>

            {/* Elegant Header Layout (Centered & Symmetrical) */}
            <div style={{ marginBottom: 36, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: mut, fontWeight: W.light, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </div>
              <div style={{ fontSize: "clamp(22px, 4.5vw, 28px)", fontWeight: 200, color: fg, marginTop: 8, letterSpacing: "-0.012em", fontFamily: F }}>
                Welcome, {state.name || user?.name || user?.email || "seeker"}.
              </div>
              
              {/* Header Micro Progress Overviews (Symmetrical Grid row) */}
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 20 }}>
                {[
                  { icon: <Flame size={12} />, val: streak, label: "Streak" },
                  { icon: <Clock size={12} />, val: Math.floor(prayerToday / 60) + "m", label: "Prayer" },
                  { icon: <Book size={12} />, val: pct + "%", label: "Bible" },
                  { icon: <Activity size={12} />, val: state.fast ? "Active" : "—", label: "Fast" }
                ].map(({ icon, val, label }) => (
                  <div
                    key={label}
                    style={{
                      background: surf,
                      border: `1px solid ${brd}`,
                      borderRadius: 14,
                      padding: "8px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
                    }}
                  >
                    <span style={{ color: C.gold }}>{icon}</span>
                    <span style={{ fontSize: 13, fontWeight: W.semibold, color: fg }}>{val}</span>
                    <span style={{ fontSize: 9, color: mut, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: W.medium }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fall Behind Notice (Symmetrical & Centered) */}
            {plan && missed.length > 0 && (
              <div
                style={{
                  background: surf,
                  backdropFilter: "blur(20px) saturate(125%)",
                  WebkitBackdropFilter: "blur(20px) saturate(125%)",
                  border: `1.5px solid ${C.gold}44`,
                  borderRadius: 24,
                  padding: "20px 24px",
                  marginBottom: 32,
                  animation: "fadeUp 0.3s forwards",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12
                }}
              >
                <div style={{ color: C.gold, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <RefreshCw size={18} style={{ animation: sweepActive ? "spin 1.2s linear infinite" : "none" }} />
                </div>
                <div>
                   <div style={{ fontSize: 14, fontWeight: W.medium, color: fg, fontFamily: F }}>Action Recommended: Restoring Balance</div>
                  <div style={{ fontSize: 12, color: mut, marginTop: 4, lineHeight: 1.5, fontFamily: F }}>
                    You are currently {missed.length} segment(s) behind your committed targeted finish date. Choose Catch Up to redistribute remaining segment readings and reset your peace.
                  </div>
                </div>
                <button
                  onClick={recalc}
                  style={{
                    background: C.gold,
                    border: "none",
                    color: C.bg,
                    fontWeight: W.bold,
                    fontSize: 11,
                    fontFamily: F,
                    borderRadius: 18,
                    padding: "8px 20px",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: 1
                  }}
                >
                  Catch Up Schedule
                </button>
              </div>
            )}

            {/* VERSE OF THE DAY: SACRED EMOTIONAL CENTERPIECE (Symmetrical) */}
            <div
              style={{
                background: dark ? `linear-gradient(180deg, rgba(18, 18, 18, 0.4) 0%, rgba(24, 24, 24, 0.4) 100%)` : `linear-gradient(180deg, rgba(255, 255, 255, 0.65) 0%, rgba(248, 248, 248, 0.65) 100%)`,
                backdropFilter: "blur(24px) saturate(130%)",
                WebkitBackdropFilter: "blur(24px) saturate(130%)",
                border: `1px solid ${C.gold}44`,
                borderRadius: 32,
                padding: "44px 32px",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                marginBottom: 32,
                textAlign: "center"
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -20,
                  right: -20,
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${C.goldGlow} 0%, transparent 70%)`,
                  pointerEvents: "none"
                }}
              />
              <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: C.gold, marginBottom: 16, fontWeight: W.bold }}>
                Verse of the Day · KJV
              </div>
              <div style={{ fontSize: "clamp(18px, 4.5vw, 22px)", fontWeight: "300", lineHeight: 1.7, color: fg, marginBottom: 24, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                "{votdText?.text || "…"}"
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{ color: C.gold, fontSize: 15, fontWeight: "300", letterSpacing: "0.08em", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                  — {votdText?.ref} —
                </div>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <button
                    onClick={saveVotdVerse}
                    style={{
                      background: "transparent",
                      border: `1px solid ${brd}`,
                      borderRadius: 24,
                      padding: "8px 20px",
                      cursor: "pointer",
                      color: mut,
                      fontFamily: F,
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.15s"
                    }}
                  >
                    <Heart size={13} /> Save Verse
                  </button>
                  <button
                    onClick={shareVerse}
                    style={{
                      background: "transparent",
                      border: `1px solid ${brd}`,
                      borderRadius: 24,
                      padding: "8px 20px",
                      cursor: "pointer",
                      color: mut,
                      fontFamily: F,
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.15s"
                    }}
                  >
                    <Share2 size={13} /> Share Passage
                  </button>
                </div>
              </div>
            </div>

            {/* SYMMETRICAL CTAs / JOURNEYS (Stacked Centers) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%", marginBottom: 36 }}>
              
              {/* Card B: scripture assign reading plan */}
              <div style={{ ...cardStyle, borderRadius: 28, padding: "32px 32px" }}>
                <div style={{ color: C.gold, marginBottom: 12, display: "flex", justifyContent: "center" }}>
                  <Book size={20} />
                </div>
                <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.gold, fontWeight: "700", marginBottom: 6 }}>
                  Reading Plan
                </div>
                <div style={{ fontSize: 19, fontWeight: "300", color: fg, fontFamily: F }}>
                  Today's Scheduled Passages
                </div>

                {plan ? (
                  <>
                    <div style={{ margin: "18px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      {todayEntry?.readings.map((r: string, i: number) => (
                        <div
                          key={i}
                          style={{
                            fontSize: 15,
                            fontWeight: "300",
                            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                            color: completed[todayEntry.day] ? C.gold : fg,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8
                          }}
                        >
                          <span style={{ color: completed[todayEntry.day] ? C.gold : mut }}>
                            {completed[todayEntry.day] ? <Check size={14} /> : <Book size={14} />}
                          </span>
                          {r}
                        </div>
                      ))}
                    </div>

                    <div style={{ height: 4, background: brd, borderRadius: 100, maxWidth: 320, margin: "0 auto 20px", overflow: "hidden", width: "100%" }}>
                      <div
                        style={{
                          width: sweepActive ? "100%" : `${pct}%`,
                          height: "100%",
                          background: sweepActive ? `linear-gradient(90deg, ${C.gold} 0%, #FFFFFF 50%, ${C.gold} 100%)` : C.gold,
                          boxShadow: sweepActive ? `0 0 12px ${C.gold}` : "none",
                          transition: "width 0.8s"
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", gap: 12, justifyContent: "center", maxWidth: 360, margin: "0 auto" }}>
                      <button
                        onClick={() => setReader({ chapters: todayEntry.chapters, dayNum: todayEntry.day })}
                        style={{ ...goldBtnStyle(), flex: 1, justifyContent: "center", fontSize: 12, padding: "10px 18px", borderRadius: 20 }}
                      >
                        <Book size={12} style={{ marginRight: 4 }} /> Begin Reading
                      </button>
                      <button
                        onClick={() => setReader({ chapters: todayEntry.chapters, dayNum: todayEntry.day, autoPlay: true })}
                        style={{ ...ghostBtnStyle(brd, fg), flex: 1, justifyContent: "center", fontSize: 12, padding: "10px 18px", borderRadius: 20 }}
                      >
                        <Headphones size={12} style={{ marginRight: 4 }} /> Listen Oral
                      </button>
                    </div>

                    {!completed[todayEntry.day] && (
                      <button
                        onClick={() => markComplete(todayEntry.day)}
                        style={{
                          marginTop: 14,
                          background: "transparent",
                          border: "none",
                          color: mut,
                          cursor: "pointer",
                          fontSize: 12,
                          textDecoration: "underline",
                          fontFamily: F
                        }}
                      >
                        Mark segment complete
                      </button>
                    )}
                  </>
                ) : (
                  <div style={{ padding: "16px 0 8px" }}>
                    <div style={{ color: mut, fontSize: 12, marginBottom: 16, lineHeight: 1.6, fontFamily: F }}>
                      Select a systematic Bible formation plan. Enjoy scheduled recalculations and offline reading.
                    </div>
                    <button
                      onClick={() => setShowPlanPick(true)}
                      style={{ ...goldBtnStyle(), padding: "10px 24px", borderRadius: 24, fontSize: 12 }}
                    >
                      Choose Reading Plan
                    </button>
                  </div>
                )}
              </div>

              {/* Card C: Guided Prayer setup */}
              <div style={{ ...cardStyle, borderRadius: 28, padding: "32px 32px", border: `1px solid ${C.gold}22` }}>
                <div style={{ color: C.gold, marginBottom: 12, display: "flex", justifyContent: "center" }}>
                  <Flame size={20} />
                </div>
                <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.gold, fontWeight: "700", marginBottom: 6 }}>
                  Spiritual Discipline
                </div>
                <div style={{ fontSize: 19, fontWeight: "300", color: fg, fontFamily: F }}>
                  Guided Prayer
                </div>
                <div style={{ fontSize: 13, color: mut, marginTop: 8, maxWidth: 460, margin: "0 auto 20px", lineHeight: 1.6, fontFamily: F }}>
                  Cycle continuously between silent reflection, structured liturgies, and daily intercessions inside our quiet space.
                </div>
                <button
                  onClick={() => setPrayer({ startStep: 0, style: "symmetrical", subject: prayerSubject, mode: prayerMode })}
                  style={{ ...goldBtnStyle(), padding: "11px 28px", borderRadius: 24, fontSize: 12 }}
                >
                  Start Guided Prayer
                </button>
              </div>

            </div>

            {/* Perfect Symmetrical Devotional Verse in Helvetica Neue */}
            <div style={{ textAlign: "center", padding: "10px 10px 24px" }}>
              <div style={{ fontSize: 14, color: mut, lineHeight: 1.7, fontWeight: W.light, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                "Come unto me, all ye that labour and are heavy laden, and I will give you rest."
              </div>
              <div style={{ fontSize: 11, color: C.gold, marginTop: 6, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                Matthew 11:28 · KJV
              </div>
            </div>

          </div>
        )}

        {/* BIBLE PLAN DETAILED VIEW */}
        {tab === "plan" && (
          <div style={{ animation: "fadeUp 0.3s forwards" }}>
            {!plan ? (
              <div style={{ ...cardStyle, textAlign: "center", maxWidth: 500, margin: "40px auto", padding: "40px 32px" }}>
                <div style={{ color: C.gold, marginBottom: 16, display: "flex", justifyContent: "center" }}>
                  <Book size={32} />
                </div>
                <h2 style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: 24, fontWeight: "400", marginBottom: 12, color: fg }}>
                  No Active Reading Plan
                </h2>
                <div style={{ color: mut, marginBottom: 24, fontSize: 14, lineHeight: 1.6, fontFamily: F }}>
                  Choose a structured Bible reading plan that fits your study pace. Complete days to measure your discipline.
                </div>
                <button onClick={() => setShowPlanPick(true)} style={{ ...goldBtnStyle(), borderRadius: 24, padding: "12px 32px" }}>
                  Choose a Plan
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT HERO CARD */}
                <div className="col-span-12 lg:col-span-4 flex flex-col justify-between p-8 rounded-3xl relative overflow-hidden"
                  style={{
                    minHeight: "480px",
                    backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.78), rgba(10, 10, 10, 0.92)), url("https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    border: `1px solid ${brd}`,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                  }}
                >
                  {/* Content Top */}
                  <div>
                    {/* Icon wrapper */}
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      border: `1px solid ${C.gold}50`,
                      background: "rgba(197, 163, 103, 0.08)",
                      marginBottom: 32,
                      color: C.gold
                    }}>
                      <Book size={20} />
                    </div>

                    {/* Plan Title */}
                    <h1 style={{
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      fontSize: "clamp(26px, 3vw, 34px)",
                      fontWeight: "400",
                      color: "#FFFFFF",
                      lineHeight: 1.25,
                      marginBottom: 8
                    }}>
                      {PLAN_PRESETS.find(p => p.id === plan.presetId)?.name || "Whole Bible Plan"}
                    </h1>

                    {/* Days Completed Progress Text */}
                    <div style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.65)", marginBottom: 20, fontFamily: F }}>
                      {completedCount} of {plan.list.length} days completed
                    </div>

                    {/* Horizontal Progress bar and percentage */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
                      <div style={{ flex: 1, height: 4, background: "rgba(255, 255, 255, 0.15)", borderRadius: 100, overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            background: C.gold,
                            borderRadius: 100,
                            transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: "600", color: C.gold, minWidth: 32, textAlign: "right" }}>
                        {pct}%
                      </div>
                    </div>
                  </div>

                  {/* Content Bottom */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {/* Quotation */}
                    <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: 20 }}>
                      <p style={{
                        fontStyle: "italic",
                        fontSize: 13,
                        color: "rgba(255, 255, 255, 0.75)",
                        lineHeight: 1.6,
                        marginBottom: 6,
                        fontFamily: "'Georgia', 'Times New Roman', serif"
                      }}>
                        “Thy word have I hid in mine heart, that I might not sin against thee.”
                      </p>
                      <span style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.gold, fontWeight: "600", fontFamily: F }}>
                        Psalm 119:11
                      </span>
                    </div>

                    {/* Buttons CTA */}
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        onClick={() => setShowPlanPick(true)}
                        style={{
                          flex: 1,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          padding: "10px 14px",
                          background: "rgba(255, 255, 255, 0.06)",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          borderRadius: 12,
                          color: "#FFFFFF",
                          fontFamily: F,
                          fontSize: 12,
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        className="hover:bg-neutral-800"
                      >
                        <RefreshCw size={14} />
                        Change Plan
                      </button>

                      <button
                        onClick={() => setConfirmAbort(true)}
                        style={{
                          flex: 1,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          padding: "10px 14px",
                          background: "rgba(220, 38, 38, 0.08)",
                          border: "1px solid rgba(220, 38, 38, 0.25)",
                          borderRadius: 12,
                          color: "#FCA5A5",
                          fontFamily: F,
                          fontSize: 12,
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        className="hover:bg-red-950/30"
                      >
                        <XCircle size={14} />
                        End Plan
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: LIST OF DAYS */}
                <div className="col-span-12 lg:col-span-8 flex flex-col">
                  {missed.length > 0 && (
                    <div style={{ ...cardStyle, marginBottom: 20, borderColor: `${C.gold}55`, padding: 18 }}>
                      <div style={{ fontSize: 14, fontWeight: W.medium, marginBottom: 4 }}>You are {missed.length} day(s) behind</div>
                      <div style={{ fontSize: 12, color: mut, marginBottom: 12 }}>
                        Recalculate to redistribute the remaining chapters and still finish by {fmtDate(plan.endDate)}.
                      </div>
                      <button onClick={recalc} style={{ ...goldBtnStyle(), fontSize: 12, padding: "8px 16px" }}>
                        Recalculate Plan
                      </button>
                    </div>
                  )}

                  <div style={{ maxHeight: "68vh", overflowY: "auto", paddingRight: 6 }}>
                    {plan.list.map((d: any) => {
                      const done = !!completed[d.day];
                      const today = d.date === todayISO();
                      return (
                        <div
                          key={d.day}
                          onClick={() => setReader({ chapters: d.chapters, dayNum: d.day })}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "18px 20px",
                            borderBottom: `1px solid ${brd}`,
                            cursor: "pointer",
                            position: "relative",
                            transition: "all 0.25s",
                            background: today ? (dark ? "rgba(197, 163, 103, 0.06)" : "rgba(197, 163, 103, 0.04)") : "transparent"
                          }}
                          className="hover:bg-neutral-800/10 group"
                        >
                          {/* Left highlight indicator pillar for active selection */}
                          {today && (
                            <div style={{
                              position: "absolute",
                              left: 0,
                              top: 8,
                              bottom: 8,
                              width: 3.5,
                              background: C.gold,
                              borderRadius: "0 4px 4px 0",
                              boxShadow: `0 0 10px ${C.gold}`
                            }} />
                          )}

                          {/* Index Number */}
                          <div style={{
                            flexShrink: 0,
                            width: 50,
                            fontSize: 22,
                            fontWeight: "400",
                            fontFamily: "'Georgia', 'Times New Roman', serif",
                            color: today ? C.gold : done ? mut : fg,
                            opacity: done ? 0.35 : today ? 1 : 0.65,
                            transition: "color 0.25s"
                          }}>
                            {d.day}
                          </div>

                          {/* Readings details */}
                          <div style={{ flex: 1, minWidth: 0, paddingLeft: 8 }}>
                            <div style={{
                              fontSize: 11,
                              fontWeight: today ? "600" : "500",
                              color: today ? C.gold : mut,
                              marginBottom: 3,
                              textTransform: "capitalize",
                              fontFamily: F
                            }}>
                              {fmtDate(d.date)} {today ? "• Today" : ""}
                            </div>
                            <div style={{
                              fontSize: 16,
                              fontWeight: "600",
                              color: done ? mut : fg,
                              fontFamily: F,
                              textDecoration: done ? "line-through" : "none",
                              opacity: done ? 0.65 : 1
                            }}>
                              {d.readings.join(" · ")}
                            </div>
                          </div>

                          {/* Chevron right */}
                          <span style={{
                            color: today ? C.gold : mut,
                            opacity: today ? 1 : 0.4,
                            transition: "transform 0.25s, opacity 0.25s",
                            transform: "translateX(0px)"
                          }} className="group-hover:translate-x-1 group-hover:opacity-100">
                            <ChevronRight size={18} />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PRAYER SCREEN VIEW */}
        {tab === "prayer" && (
          <div style={{ animation: "fadeUp 0.3s forwards" }} className="max-w-7xl mx-auto px-1 sm:px-2 py-2">
            
            {/* Elegant Premium Top Header Navigation with Inner Tabs */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24, borderBottom: `1px solid ${brd}`, paddingBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: W.bold, fontFamily: F, letterSpacing: 3, color: C.text, textTransform: "uppercase" }}>PRAYER</span>
                <span style={{ fontSize: 11, color: C.gold, opacity: 0.8, fontWeight: W.medium }}>• SANCTUARY</span>
              </div>
              
              {/* Inner Tabs Selector */}
              <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                {[
                  { id: "dashboard", label: "Dashboard" },
                  { id: "modes", label: "Prayer Modes" },
                  { id: "list", label: "Prayer List" }
                ].map((t) => {
                  const active = prayerSubTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setPrayerSubTab(t.id as any)}
                      style={{
                        position: "relative",
                        background: "none",
                        border: "none",
                        color: active ? C.text : mut,
                        fontSize: 12.5,
                        fontWeight: active ? W.semibold : W.light,
                        cursor: "pointer",
                        padding: "6px 2px",
                        transition: "color 0.2s"
                      }}
                      className="hover:text-white"
                    >
                      {t.label}
                      {active && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: -17, // aligns beautifully with the border bottom
                            left: 0,
                            right: 0,
                            height: 2.5,
                            background: C.gold,
                            borderRadius: 1
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div style={{ fontSize: 10, color: mut }} className="font-mono hidden sm:block">
                {new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {/* INNER CONTENT DOCK PANEL */}
            {prayerSubTab === "dashboard" && (
              <div className="flex flex-col gap-6 items-stretch w-full">
                
                {/* SCRIPTURAL REMINDER - MOVED TO TOP */}
                <div style={{ ...cardStyle, padding: "18px 22px", background: "linear-gradient(135deg, rgba(30, 20, 36, 0.45) 0%, rgba(18, 18, 18, 0.5) 100%)", border: `1.2px solid rgba(197, 163, 103, 0.22)`, position: "relative", overflow: "hidden" }} className="w-full">
                  <div style={{ position: "absolute", bottom: "-40%", left: "-20%", width: "100%", height: "100%", background: `radial-gradient(circle, rgba(142, 68, 173, 0.12) 0%, transparent 75%)`, pointerEvents: "none" }} />
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                    <BookOpen size={14} style={{ color: C.gold }} />
                    <span style={{ fontSize: 10, fontWeight: W.bold, letterSpacing: 1.5, color: C.gold, textTransform: "uppercase" }}>
                      Scriptural Reminder
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: fg, fontWeight: "300", fontStyle: "italic", lineHeight: "1.45" }}>
                     "Let my prayer be set forth before thee as incense; and the lifting up of my hands as the evening sacrifice."
                  </p>
                  <span style={{ display: "block", fontSize: 9.5, color: C.gold, marginTop: 6, fontWeight: W.medium }}>
                    — PSALMS 141:2
                  </span>
                </div>

                {/* HEADER / BANNER WITH TODAY AT A GLANCE */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  
                  {/* Greeting Column Banner (Dynamic time-of-day matching) */}
                  <div className="lg:col-span-12 xl:col-span-8 flex flex-col justify-between" style={{ ...cardStyle, padding: 22 }}>
                     {(() => {
                       const hr = new Date().getHours();
                       const displayName = state.name || (user?.name ? user.name : (user?.email ? user.email.split('@')[0] : "Ian"));
                       const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
                       
                       let greeting = "Good morning";
                       let encouragement = "Your first prayer can change your entire day.";
                       let scripture = "Draw near to God, and He will draw near to you.";
                       let scriptureRef = "James 4:8";

                       if (hr >= 12 && hr < 17) {
                         greeting = "Good afternoon";
                         encouragement = "Take a moment to align your posture in His stillness.";
                         scripture = "Evening, and morning, and at noon, will I pray, and cry aloud: and he shall hear my voice.";
                         scriptureRef = "Psalms 55:17";
                       } else if (hr >= 17 && hr < 21) {
                         greeting = "Good evening";
                         encouragement = "Rest is not earned. Pour out the day's speed.";
                         scripture = "Let my prayer be set forth before thee as incense; and the lifting up of my hands as the evening sacrifice.";
                         scriptureRef = "Psalms 141:2";
                       } else if (hr >= 21 || hr < 4) {
                         greeting = "Good night";
                         encouragement = "Sleep safely in His fortress. He watches your heart.";
                         scripture = "When thou liest down, thou shalt not be afraid: yea, thou shalt lie down, and thy sleep shall be sweet.";
                         scriptureRef = "Proverbs 3:24";
                       }

                       return (
                         <div style={{ display: "flex", flexDirection: "column", justifySelf: "stretch" }}>
                           <span style={{ fontSize: 11.5, color: C.gold, fontWeight: W.medium, letterSpacing: "0.05em", display: "block", marginBottom: 6, textTransform: "uppercase" }}>
                             {greeting}, {capitalizedName}.
                           </span>
                           <h1 style={{ fontSize: 24, fontWeight: 300, color: fg, lineHeight: "1.35", letterSpacing: "-0.5px", fontFamily: F, marginBottom: 14 }}>
                             {encouragement}
                           </h1>
                           <div style={{ borderLeft: `1.5px solid ${C.gold}35`, paddingLeft: 12, marginBottom: 18 }}>
                             <p style={{ fontSize: 12.5, color: mut, fontStyle: "italic", lineHeight: "1.4" }}>
                               "{scripture}"
                             </p>
                             <span style={{ fontSize: 9.5, color: C.gold, fontWeight: W.semibold, letterSpacing: 0.5, display: "block", marginTop: 4 }}>
                               — {scriptureRef}
                             </span>
                           </div>
                           
                           <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                             <button
                               onClick={() => setPrayer({ startStep: 0, style: "symmetrical", subject: "default", mode: "guided" })}
                               style={{
                                 ...goldBtnStyle(),
                                 padding: "10px 18px",
                                 fontSize: 11,
                                 fontWeight: W.semibold,
                                 borderRadius: 9999
                               }}
                             >
                               <Sparkles size={11.5} style={{ marginRight: 6 }} /> Start Praying Now
                             </button>
                             <button
                               onClick={() => setPrayerSubTab("modes")}
                               style={{
                                 background: "transparent",
                                 border: "none",
                                 color: C.gold,
                                 fontSize: 11,
                                 fontWeight: W.medium,
                                 cursor: "pointer",
                                 display: "flex",
                                 alignItems: "center",
                                 gap: 2
                               }}
                               className="hover:underline"
                             >
                               View Prayer Modes <ChevronRight size={12} />
                             </button>
                           </div>
                         </div>
                       );
                     })()}
                  </div>

                  {/* TODAY AT A GLANCE METRICS BOX */}
                  <div className="lg:col-span-12 xl:col-span-4 flex flex-col justify-between" style={{ ...cardStyle, padding: 22 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: W.bold, color: C.gold, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>
                        TODAY AT A GLANCE
                      </div>

                      {/* 4 horizontal micro-stat squares */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 14 }}>
                        {[
                          { val: "0m", label: "Today" },
                          { val: "0", label: "Sessions" },
                          { val: "0", label: "Points" },
                          { val: "0d", label: "Streak" }
                        ].map((m, idx) => (
                          <div key={idx} style={{ background: dark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.01)", border: `1px solid ${brd}`, padding: "10px 2px", borderRadius: 8, textAlign: "center" }}>
                            <div style={{ fontSize: 15, fontWeight: W.light, color: fg }}>{m.val}</div>
                            <div style={{ fontSize: 8, color: mut, textTransform: "uppercase", letterSpacing: 0.2, marginTop: 3 }}>{m.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: dark ? "rgba(18, 18, 18, 0.40)" : "rgba(255, 255, 255, 0.6)", border: `1px solid rgba(197, 163, 103, 0.15)`, borderRadius: 10, padding: 12, display: "flex", gap: 10, alignItems: "center" }}>
                      <Sun size={18} style={{ color: C.gold, opacity: 0.8, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: W.semibold, color: fg }}>You haven't prayed yet today.</div>
                        <p style={{ fontSize: 9.5, color: mut, marginTop: 1, lineHeight: 1.3 }}>
                          Start your day with God. Even a few minutes can set your heart aright.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* SYMMETRICAL WIDGETS SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  
                  {/* PREMIUM PRAYER JOURNEY BAR CHART (Equal Sized) */}
                  <div className="lg:col-span-6 flex flex-col justify-between" style={{ ...cardStyle, padding: 22 }}>
                     <div>
                       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                         <span style={{ fontSize: 10, fontWeight: W.bold, letterSpacing: 1.5, color: C.gold, textTransform: "uppercase" }}>
                           YOUR PRAYER JOURNEY
                         </span>
                         <div style={{ display: "flex", alignItems: "center", gap: 4, background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", border: `1px solid ${brd}`, borderRadius: 6, padding: "3px 6px", fontSize: 10, color: mut }}>
                           <span>Overall</span>
                         </div>
                       </div>

                       {/* Zeroed out Stats Row */}
                       <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 18, borderBottom: `1px dashed ${brd}`, paddingBottom: 16 }}>
                         <div>
                           <span style={{ display: "block", fontSize: 9, color: mut, textTransform: "uppercase", letterSpacing: 0.3 }}>Total Time</span>
                           <div style={{ fontSize: 18, fontWeight: W.light, color: fg, marginTop: 2 }}>0m</div>
                           <span style={{ fontSize: 8.5, color: mut, display: "block", marginTop: 2 }}>— 0%</span>
                         </div>
                         <div>
                           <span style={{ display: "block", fontSize: 9, color: mut, textTransform: "uppercase", letterSpacing: 0.3 }}>Sessions</span>
                           <div style={{ fontSize: 18, fontWeight: W.light, color: fg, marginTop: 2 }}>0</div>
                           <span style={{ fontSize: 8.5, color: mut, display: "block", marginTop: 2 }}>— 0 sessions</span>
                         </div>
                         <div>
                           <span style={{ display: "block", fontSize: 9, color: mut, textTransform: "uppercase", letterSpacing: 0.3 }}>Streak</span>
                           <div style={{ fontSize: 18, fontWeight: W.light, color: fg, marginTop: 2 }}>0 Days</div>
                           <span style={{ fontSize: 8.5, color: C.gold, display: "block", marginTop: 2 }}>Ready to begin</span>
                         </div>
                       </div>
                     </div>

                     {/* Zeroed out Bar Chart */}
                     <div style={{ position: "relative", height: 110, display: "flex", flexDirection: "column", justifyContent: "space-between", marginTop: 6 }}>
                       <div style={{ position: "absolute", top: 0, bottom: 20, left: 30, right: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none" }}>
                         <div style={{ borderBottom: `1px dashed ${brd}`, width: "100%", height: 0 }} />
                         <div style={{ borderBottom: `1px dashed ${brd}`, width: "100%", height: 0 }} />
                         <div style={{ borderBottom: `1px dashed ${brd}`, width: "100%", height: 0 }} />
                       </div>

                       <div style={{ display: "flex", height: "100%", alignItems: "flex-end" }}>
                         <div style={{ width: 30, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: 9, color: mut, paddingBottom: 20, textAlign: "right", paddingRight: 6 }} className="font-mono">
                           <span>60m</span>
                           <span>30m</span>
                           <span>0m</span>
                         </div>

                         <div style={{ flex: 1, display: "flex", justifyContent: "space-around", height: "100%", alignItems: "flex-end", paddingBottom: 20 }}>
                           {[
                             { day: "M", val: 0 },
                             { day: "T", val: 0 },
                             { day: "W", val: 0 },
                             { day: "T", val: 0 },
                             { day: "F", val: 0 },
                             { day: "S", val: 0 },
                             { day: "S", val: 0 }
                           ].map((d, index) => {
                             return (
                               <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, height: "100%", justifyContent: "flex-end" }}>
                                 <div style={{ width: 12, height: "1px", background: C.gold, opacity: 0.3, borderRadius: "2px 2px 0 0" }} />
                                 <div style={{ fontSize: 9, color: mut, marginTop: 4, fontFamily: F }}>{d.day}</div>
                               </div>
                             );
                           })}
                         </div>
                       </div>
                     </div>
                  </div>

                  {/* PREMIUM PRAYER FOCUS SVG DONUT + DETAILED TIMELINE STATS (Equal Sized) */}
                  <div className="lg:col-span-6 flex flex-col justify-between" style={{ ...cardStyle, padding: 22 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: W.bold, color: C.gold, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>
                        PRAYER FOCUS
                      </div>

                      <div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "space-around", flexWrap: "wrap", marginBottom: 12 }}>
                        {/* Zeroed out donut chart */}
                        <div style={{ position: "relative", width: 105, height: 105, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="100%" height="100%" viewBox="0 0 80 80" style={{ transform: "rotate(-90deg)" }}>
                            <circle cx="40" cy="40" r="30" fill="transparent" stroke={dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"} strokeWidth="5.5" />
                          </svg>
                          
                          <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                            <span style={{ fontSize: 8.5, color: mut, textTransform: "uppercase", letterSpacing: 0.3 }}>This Week</span>
                            <span style={{ fontSize: 13, fontWeight: W.bold, color: fg, margin: "1px 0" }}>0m</span>
                            <span style={{ fontSize: 8, color: mut }}>Total</span>
                          </div>
                        </div>

                        {/* Chart Legends */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 5.5 }}>
                          {[
                            { name: "Adoration", pct: "0%", color: "#6A819C" },
                            { name: "Confession", pct: "0%", color: "#8E44AD" },
                            { name: "Thanksgiving", pct: "0%", color: "#C5A367" },
                            { name: "Supplication", pct: "0%", color: "#D9905B" },
                            { name: "Intercession", pct: "0%", color: "#4F8182" }
                          ].map((leg, idx) => (
                            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6.5 }}>
                              <div style={{ width: 7, height: 7, borderRadius: "50%", background: leg.color }} />
                              <span style={{ fontSize: 10.5, color: fg, opacity: 0.85, width: 80 }}>{leg.name}</span>
                              <span style={{ fontSize: 10.5, fontWeight: W.semibold, color: C.gold }} className="font-mono">{leg.pct}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* ADDED TIMELINE RANGE METRICS */}
                    <div style={{ borderTop: `1px dashed ${brd}`, paddingTop: 14, marginTop: 10 }}>
                      <span style={{ fontSize: 9.5, fontWeight: W.bold, letterSpacing: 1, color: C.gold, textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                        Focused Posture Timeline
                      </span>
                      <div className="grid grid-cols-5 gap-1.5 text-center">
                        {[
                          { label: "This Week", val: "0m" },
                          { label: "This Month", val: "0m" },
                          { label: "This Quarter", val: "0m" },
                          { label: "This Year", val: "0m" },
                          { label: "Custom Range", val: "0m" }
                        ].map((st, i) => (
                          <div key={i} style={{ background: dark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.01)", border: `1px solid ${brd}`, padding: "6px 2px", borderRadius: 6 }}>
                            <span style={{ display: "block", fontSize: 8, color: mut, whiteSpace: "nowrap" }}>{st.label}</span>
                            <span style={{ fontSize: 11, fontWeight: W.semibold, color: fg, display: "block", marginTop: 2 }}>{st.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* RECENT SESSIONS FULL WIDTH - 4 ITEMS IN 2 COLUMNS */}
                <div style={{ ...cardStyle, padding: 22 }} className="w-full">
                  <div style={{ fontSize: 10, fontWeight: W.bold, color: C.gold, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>
                    RECENT SESSIONS
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: "Morning Devotion", time: "Scheduled Rhythm", duration: "0m" },
                      { title: "Midday Contemplation", time: "Scheduled Rhythm", duration: "0m" },
                      { title: "Evening Gratitude", time: "Scheduled Rhythm", duration: "0m" },
                      { title: "Midnight Vigil", time: "Scheduled Rhythm", duration: "0m" }
                    ].map((s, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setPrayer({ startStep: 0, style: "symmetrical", subject: "default", mode: "guided" })}
                        style={{ background: dark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.01)", border: `1px solid ${brd}`, borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }} 
                        className="hover:border-amber-500/30 transition-all cursor-pointer group"
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 14, height: 14, borderRadius: "50%", border: `1.5px solid ${C.gold}`, opacity: 0.7 }} />
                          <div>
                            <span style={{ display: "block", fontSize: 11.5, fontWeight: W.medium, color: fg }}>{s.title}</span>
                            <span style={{ display: "block", fontSize: 9.5, color: mut, marginTop: 1 }}>{s.time}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: mut, fontSize: 10.5 }}>
                          <span className="font-mono">{s.duration}</span>
                          <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {prayerSubTab === "modes" && (
              <div className="flex flex-col gap-6" style={{ animation: "fadeUp 0.3s forwards" }}>
                <div style={{ ...cardStyle, padding: 24 }}>
                  <h2 style={{ fontSize: 18, fontWeight: W.bold, color: fg, fontFamily: F, marginBottom: 6 }}>
                    Sacred Prayer Disciplines & Modes
                  </h2>
                  <p style={{ fontSize: 12.5, color: mut, lineHeight: 1.5, marginBottom: 20 }}>
                    Select a dynamic structured posture to enter into focused intercession, morning consecration, or structured Scripture-based prayer.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PRAYER_MODES_LIST.map((mode, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedPreviewMode(mode)}
                        style={{
                          background: dark ? "rgba(255,255,255,0.01)" : "white",
                          border: `1.2px solid ${brd}`,
                          borderRadius: 14,
                          padding: 20,
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          transition: "all 0.2s"
                        }}
                        className="hover:border-amber-500/40 hover:bg-white/[0.015] hover:scale-[1.01]"
                      >
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <span style={{ fontSize: 9, color: C.gold, background: C.goldGlow, padding: "3px 8px", borderRadius: 8, fontWeight: W.bold }} className="font-mono">
                              {mode.duration}
                            </span>
                            <Sparkles size={12} style={{ color: C.gold }} />
                          </div>
                          <h3 style={{ fontSize: 14, fontWeight: W.bold, color: fg, marginBottom: 8 }}>
                            {mode.title}
                          </h3>
                          <p style={{ fontSize: 11, color: mut, lineHeight: 1.4, marginBottom: 12 }}>
                            {mode.desc}
                          </p>
                        </div>
                        
                        <div style={{ borderTop: `1px dashed ${brd}`, paddingTop: 10, marginTop: "auto" }}>
                          <span style={{ fontSize: 9.5, color: C.gold, display: "flex", alignItems: "center", gap: 3, fontWeight: W.semibold }}>
                            Explore Mode & Begin <ChevronRight size={10} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {prayerSubTab === "list" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" style={{ animation: "fadeUp 0.3s forwards" }}>
                
                {/* LEFT COLUMN: PRAYER LISTS */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  <div style={{ ...cardStyle, padding: 22 }}>
                    
                    {/* Search bar inside running list */}
                    <div style={{ position: "relative", width: "100%", marginBottom: 14 }}>
                      <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: mut }} />
                      <input
                        type="text"
                        placeholder="Search requests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          width: "100%",
                          background: dark ? "rgba(0,0,0,0.3)" : "white",
                          border: `1.2px solid ${brd}`,
                          borderRadius: 10,
                          padding: "8px 12px 8px 32px",
                          fontSize: 11,
                          color: fg
                        }}
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", color: mut, cursor: "pointer" }}>
                          <X size={10} />
                        </button>
                      )}
                    </div>

                    {/* Custom List Filter Tabs */}
                    <div style={{ display: "flex", gap: 2, background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", padding: 2, borderRadius: 8, border: `1px solid ${brd}`, marginBottom: 14 }}>
                      {[
                        { key: "all", label: "My List" },
                        { key: "memorial", label: "Memorial" },
                        { key: "ongoing", label: "Ongoing" },
                        { key: "answered", label: "Answered" }
                      ].map((t) => (
                        <button
                          key={t.key}
                          onClick={() => setPrayerListTab(t.key as any)}
                          style={{
                            flex: 1,
                            padding: "6px 2px",
                            fontSize: 10,
                            fontWeight: prayerListTab === t.key ? W.semibold : W.light,
                            border: "none",
                            borderRadius: 6,
                            background: prayerListTab === t.key ? C.gold : "transparent",
                            color: prayerListTab === t.key ? C.bg : mut,
                            cursor: "pointer",
                            transition: "all 0.15s"
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* Scrollable Items Container */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "500px", overflowY: "auto", paddingRight: 2 }} className="scrolling-element">
                      {(() => {
                        // Filter list values
                        const filtered = prayerList.filter((item) => {
                          // Category Tabs Matching
                          if (prayerListTab === "memorial") {
                            if (item.type !== "Memorial Prayers") return false;
                          } else if (prayerListTab === "ongoing") {
                            if (item.type !== "Ongoing Prayers") return false;
                          } else if (prayerListTab === "answered") {
                            if (item.type !== "Answered Prayers") return false;
                          } else {
                            // "My List" excludes Answered and Memorial so it shows Request, Ongoing, Family, Church, Missionary
                            if (item.type === "Answered Prayers" || item.type === "Memorial Prayers") return false;
                          }

                          // Search Query filter
                          if (searchQuery.trim()) {
                            const q = searchQuery.toLowerCase();
                            return item.title.toLowerCase().includes(q) || (item.notes && item.notes.toLowerCase().includes(q));
                          }
                          return true;
                        });

                        // Sort: pinned first, then high priority first, then added date
                        const sorted = [...filtered].sort((a, b) => {
                          if (a.pinned && !b.pinned) return -1;
                          if (!a.pinned && b.pinned) return 1;
                          if (a.favorite && !b.favorite) return -1;
                          if (!a.favorite && b.favorite) return 1;
                          
                          const pRank = { High: 3, Medium: 2, Low: 1 };
                          const aRank = pRank[a.priority as keyof typeof pRank] || 1;
                          const bRank = pRank[b.priority as keyof typeof pRank] || 1;
                          return bRank - aRank;
                        });

                        if (sorted.length === 0) {
                          return (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "160px", color: mut, textAlign: "center", gap: 6 }}>
                              <Leaf size={20} style={{ opacity: 0.3 }} />
                              <div style={{ fontSize: 11, fontWeight: W.medium }}>No focus items here</div>
                              <div style={{ fontSize: 9, maxWidth: "160px" }}>Use the right-hand panel to formulate and register a brand new prayer burden.</div>
                            </div>
                          );
                        }

                        return sorted.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              background: dark ? "rgba(255,255,255,0.015)" : "white",
                              border: `1px solid ${item.pinned ? `${C.gold}55` : brd}`,
                              borderRadius: 10,
                              padding: 10,
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                              position: "relative"
                            }}
                            className="hover:scale-[0.99] transition-transform"
                          >
                            <div style={{ display: "flex", items: "flex-start", justifyContent: "space-between", gap: 8 }}>
                              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                {item.pinned && <Pin size={9} style={{ color: C.gold }} className="transform -rotate-45" title="Pinned" />}
                                <span style={{ fontSize: 11, fontWeight: W.bold, color: fg }}>{item.title}</span>
                              </div>
                              
                              {/* Action icons row */}
                              <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                                <button
                                  onClick={() => {
                                    setPrayerList(prayerList.map(p => p.id === item.id ? { ...p, pinned: !p.pinned } : p));
                                  }}
                                  style={{ background: "none", border: "none", color: item.pinned ? C.gold : mut, cursor: "pointer", padding: 2 }}
                                  title="Pin focus"
                                >
                                  <Pin size={10} className={item.pinned ? "" : "opacity-30"} />
                                </button>
                                <button
                                  onClick={() => {
                                    setPrayerList(prayerList.map(p => p.id === item.id ? { ...p, favorite: !p.favorite } : p));
                                  }}
                                  style={{ background: "none", border: "none", color: item.favorite ? "#F1C40F" : mut, cursor: "pointer", padding: 2 }}
                                  title="Favorite"
                                >
                                  <Star size={10} className={item.favorite ? "fill-current" : "opacity-30"} />
                                </button>
                              </div>
                            </div>

                            {item.notes && (
                              <p style={{ fontSize: 10, color: mut, lineHeight: 1.35 }} className="font-sans line-clamp-2">
                                {item.notes}
                              </p>
                            )}

                            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", marginTop: 4, borderTop: `1px dashed ${brd}`, paddingTop: 4, gap: 4 }}>
                              <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                                <span style={{ fontSize: 8, background: item.priority === "High" ? "rgba(236,112,99,0.15)" : item.priority === "Medium" ? "rgba(241,196,15,0.15)" : "rgba(255,255,255,0.05)", color: item.priority === "High" ? "#EC7063" : item.priority === "Medium" ? "#F1C40F" : mut, padding: "1px 4px", borderRadius: 3, fontStyle: "normal", fontWeight: W.bold }}>
                                  {item.priority}
                                </span>
                                <span style={{ fontSize: 8, color: mut, opacity: 0.8 }} className="font-mono">
                                  {item.type.replace(" Prayers", "")}
                                </span>
                              </div>

                              <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                                {item.type !== "Answered Prayers" && (
                                  <button
                                    onClick={() => {
                                      // Move to Answered category
                                      setPrayerList(prayerList.map(p => p.id === item.id ? { ...p, type: "Answered Prayers" } : p));
                                      showToast("Moved to Answered Tab");
                                    }}
                                    style={{
                                      background: "transparent",
                                      border: `1px solid ${C.gold}30`,
                                      padding: "1px 4px",
                                      borderRadius: 4,
                                      color: C.gold,
                                      fontSize: 8,
                                      cursor: "pointer"
                                    }}
                                    title="Mark Answered"
                                  >
                                    Answered 🎉
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => {
                                    // Update Last Prayed timestamp
                                    const todayStr = new Date().toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
                                    setPrayerList(prayerList.map(p => p.id === item.id ? { ...p, lastPrayedDate: todayStr } : p));
                                    showToast(`Marked prayed at ${todayStr}`);
                                  }}
                                  style={{
                                    background: C.gold,
                                    border: "none",
                                    padding: "2px 5px",
                                    borderRadius: 4,
                                    color: C.bg,
                                    fontSize: 8,
                                    fontWeight: W.bold,
                                    cursor: "pointer"
                                  }}
                                >
                                  Prayed ✔
                                </button>

                                <button
                                  onClick={() => {
                                    setPrayerList(prayerList.filter(p => p.id !== item.id));
                                    showToast("Removed from sanctuary");
                                  }}
                                  style={{ background: "none", border: "none", color: "#EC7063", cursor: "pointer", padding: 1 }}
                                  title="Delete"
                                >
                                  <Trash2 size={10} className="opacity-40 hover:opacity-100 transition-opacity" />
                                </button>
                              </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: mut, marginTop: 2 }} className="font-mono opacity-80">
                              <span>Added: {item.dateAdded}</span>
                              {item.lastPrayedDate && (
                                <span>Last: {item.lastPrayedDate}</span>
                              )}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>

                  </div>
                </div>

                {/* RIGHT COLUMN: ADD FOCUS FORM */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div style={{ ...cardStyle, padding: 20 }}>
                    <div style={{ fontSize: 10, fontWeight: W.bold, color: C.gold, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>
                      Add Focus to Sanctuary
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <div>
                        <label style={{ display: "block", fontSize: 9, color: mut, marginBottom: 3 }}>Description / Name</label>
                        <input
                          type="text"
                          placeholder="Enter description, name, or request..."
                          value={newPrayerTitle}
                          onChange={(e) => setNewPrayerTitle(e.target.value)}
                          style={{ width: "100%", background: dark ? "rgba(0,0,0,0.5)" : "white", border: `1px solid ${brd}`, borderRadius: 8, padding: 7, fontSize: 11, color: fg }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label style={{ display: "block", fontSize: 9, color: mut, marginBottom: 3 }}>Category</label>
                          <select
                            value={newPrayerType}
                            onChange={(e) => setNewPrayerType(e.target.value)}
                            style={{ width: "100%", background: dark ? "rgba(0,0,0,0.5)" : "white", border: `1px solid ${brd}`, borderRadius: 8, padding: 6, fontSize: 10, color: fg, cursor: "pointer" }}
                          >
                            <option value="Prayer Requests">Request</option>
                            <option value="Ongoing Prayers">Ongoing</option>
                            <option value="Memorial Prayers">Memorial</option>
                            <option value="Family Prayers">Family</option>
                            <option value="Church Prayers">Church</option>
                            <option value="Missionary Prayers">Missionary</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: 9, color: mut, marginBottom: 3 }}>Priority</label>
                          <select
                            value={newPrayerPriority}
                            onChange={(e) => setNewPrayerPriority(e.target.value)}
                            style={{ width: "100%", background: dark ? "rgba(0,0,0,0.5)" : "white", border: `1px solid ${brd}`, borderRadius: 8, padding: 6, fontSize: 10, color: fg, cursor: "pointer" }}
                          >
                            <option value="High">🔴 High</option>
                            <option value="Medium">🟡 Medium</option>
                            <option value="Low">⚪ Low</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 9, color: mut, marginBottom: 3 }}>Notes & Attributes</label>
                        <textarea
                          placeholder="Additional scriptures, progress notes, or burdens..."
                          rows={3}
                          value={newPrayerNotes}
                          onChange={(e) => setNewPrayerNotes(e.target.value)}
                          style={{ width: "100%", background: dark ? "rgba(0,0,0,0.5)" : "white", border: `1px solid ${brd}`, borderRadius: 8, padding: 7, fontSize: 11, color: fg, resize: "none" }}
                        />
                      </div>

                      <button
                        onClick={() => {
                          if (!newPrayerTitle.trim()) {
                            showToast("Please enter a title or description");
                            return;
                          }
                          const newItem = {
                            id: "pray-" + Date.now(),
                            title: newPrayerTitle.trim(),
                            type: newPrayerType,
                            priority: newPrayerPriority,
                            notes: newPrayerNotes.trim(),
                            dateAdded: new Date().toISOString().slice(0, 10),
                            pinned: false,
                            favorite: false,
                            lastPrayedDate: null
                          };
                          setPrayerList([newItem, ...prayerList]);
                          setNewPrayerTitle("");
                          setNewPrayerNotes("");
                          
                          // Auto set active subtab based on what was added
                          if (newPrayerType === "Memorial Prayers") setPrayerListTab("memorial");
                          else if (newPrayerType === "Ongoing Prayers") setPrayerListTab("ongoing");
                          else setPrayerListTab("all");
                          
                          showToast("Added to prayer list");
                        }}
                        style={{ ...goldBtnStyle(), padding: "8px 12px", width: "100%", justifyContent: "center", borderRadius: 8, fontSize: 11, marginTop: 4 }}
                      >
                        Register New Burden
                      </button>
                    </div>
                  </div>

                  {/* Symmetrical Footnote Posture Card */}
                  <div style={{ ...cardStyle, padding: 16, background: "rgba(197, 163, 103, 0.015)", border: `1px solid ${C.gold}15` }}>
                    <div style={{ fontSize: 10, color: C.gold, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3, fontWeight: W.bold }}>
                      Sacred Quiet Posture
                    </div>
                    <p style={{ fontSize: 11, color: mut, lineHeight: "1.4" }}>
                      Enable Do Not Disturb, inhale for 4 seconds, and clear modern thoughts before launching any focal experience.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* MODE PREVIEW SCREEN (GLORIOUS GLASS COVER) */}
            {selectedPreviewMode && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
                <div style={{ ...cardStyle, width: "100%", maxWidth: "520px", padding: 24, border: `1.5px solid ${C.gold}45`, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)", animation: "fadeUp 0.3s forwards" }}>
                  
                  {/* Modal Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <span style={{ fontSize: 9, color: C.gold, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: W.bold }}>
                        Prayer Focus Experience
                      </span>
                      <h3 style={{ fontSize: 20, fontWeight: "300", color: fg, fontFamily: F, marginTop: 2 }}>
                        {selectedPreviewMode.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedPreviewMode(null)}
                      style={{ background: "rgba(255,255,255,0.05)", border: "none", color: fg, borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                      className="hover:bg-white/10"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  {/* Program Description */}
                  <p style={{ fontSize: 12, color: mut, lineHeight: 1.5, marginBottom: 16 }}>
                    {selectedPreviewMode.desc}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${brd}`, padding: 10, borderRadius: 10 }}>
                      <span style={{ display: "block", fontSize: 9, color: mut, textTransform: "uppercase" }}>Expected Duration</span>
                      <strong style={{ fontSize: 12, color: C.gold, fontWeight: W.bold }}>{selectedPreviewMode.duration}</strong>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${brd}`, padding: 10, borderRadius: 10 }}>
                      <span style={{ display: "block", fontSize: 9, color: mut, textTransform: "uppercase" }}>Methodology</span>
                      <strong style={{ fontSize: 12, color: fg, fontWeight: W.bold }}>
                        {selectedPreviewMode.mode === "open" ? "Manual Open Flow" : "System Guided"} (Symmetrical)
                      </strong>
                    </div>
                  </div>

                  {/* Included disciplines */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, color: C.gold, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: W.bold, marginBottom: 8 }}>
                      What's Included
                    </div>
                    <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto scrolling-element pr-2">
                      {selectedPreviewMode.disciplines.map((disc: string, dIdx: number) => (
                        <div key={dIdx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Check size={11} style={{ color: C.gold }} />
                          <span style={{ fontSize: 11, color: fg }}>{disc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scriptures Segment */}
                  <div style={{ marginBottom: 20, borderTop: `1px dashed ${brd}`, paddingTop: 12 }}>
                    <div style={{ fontSize: 10, color: C.gold, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: W.bold, marginBottom: 6 }}>
                      Anchor Scriptures Included
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPreviewMode.scriptures.map((scr: string, sIdx: number) => (
                        <span key={sIdx} style={{ fontSize: 9, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", border: `1px solid ${brd}`, padding: "2px 6px", borderRadius: 6, color: mut }}>
                          {scr}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Launch button */}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => setSelectedPreviewMode(null)}
                      style={{
                        flex: 1,
                        background: "rgba(255,255,255,0.05)",
                        border: `1px solid ${brd}`,
                        padding: "10px",
                        borderRadius: 12,
                        color: fg,
                        fontSize: 11,
                        cursor: "pointer",
                        fontWeight: W.semibold
                      }}
                      className="hover:bg-white/10"
                    >
                      Close Preview
                    </button>
                    <button
                      onClick={() => {
                        setPrayer({ startStep: 0, style: "symmetrical", subject: selectedPreviewMode.subject, mode: selectedPreviewMode.mode });
                        setSelectedPreviewMode(null);
                      }}
                      style={{
                        ...goldBtnStyle(),
                        flex: 2,
                        justifyContent: "center",
                        padding: "10px",
                        borderRadius: 12,
                        fontSize: 11
                      }}
                    >
                      <Sparkles size={13} style={{ marginRight: 6 }} /> [ Begin Prayer Session ]
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

        {/* MEDITATION VIEW */}
        {tab === "meditate" && (() => {
          const TOPIC_ICON_MAP: Record<string, any> = {
            peace: Leaf,
            rest: Waves,
            faith: Plus,
            fear: Shield,
            anxiety: Activity,
            healing: Heart,
            salvation: Sun,
            prayer: MessageSquare,
            strength: Shield,
            forgive: Heart,
            joy: Sun,
            hope: Sparkles,
            direction: Compass,
            holiness: Flame,
            holyghost: Feather,
            trust: Leaf,
            promises: Crown,
            comfort: Heart,
            guidance: Milestone,
            protection: Shield,
            victory: Flag,
          };
          
          return (
            <div style={{ animation: "fadeUp 0.3s forwards" }}>
              <div style={{
                color: C.gold,
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "4px",
                fontWeight: "700",
                marginBottom: 10,
                fontFamily: F
              }}>
                SCRIPTURE MEDITATION • KJV
              </div>
              <h1 style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: "clamp(32px, 4vw, 42px)",
                fontWeight: "400",
                color: fg,
                lineHeight: 1.2,
                marginBottom: 14
              }}>
                Choose your theme
              </h1>
              <p style={{
                fontSize: 14,
                color: mut,
                lineHeight: "1.6",
                maxWidth: "600px",
                marginBottom: 36,
                fontFamily: F
              }}>
                Enter an immersive, distraction-free Sanctuary session.
                <br />
                Set your background prayer loops and narrator speed inside.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {MEDITATE_TOPICS.map((t, idx) => {
                  const IconComponent = TOPIC_ICON_MAP[t.id] || Sparkles;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setFocusSessionType("promises");
                        setFocusTopicIdx(idx);
                        setInFocusMode(true);
                      }}
                      className="group flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 hover:scale-102 cursor-pointer text-center"
                      style={{
                        background: surf2,
                        borderColor: brd,
                        fontFamily: F
                      }}
                    >
                      {/* Icon Container */}
                      <div className="mb-4 text-center transition-transform duration-300 group-hover:scale-110" style={{ color: C.gold }}>
                        <IconComponent size={28} strokeWidth={1.5} />
                      </div>
                      
                      {/* Theme Name */}
                      <div style={{ fontSize: 16, fontWeight: W.medium, color: fg, marginBottom: 4 }}>
                        {t.name}
                      </div>
                      
                      {/* Subtitle */}
                      <div style={{ fontSize: 11, color: mut, textTransform: "lowercase" }}>
                        {t.refs.length} scriptures
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* FRIENDS VIEW */}
        {tab === "friends" && (
          <div style={{ animation: "fadeUp 0.3s forwards" }}>
            <FriendsView
              state={state}
              setState={setState}
              card={cardStyle}
              sectionLabel={sectionLabelStyle}
              mut={mut}
              fg={fg}
              brd={brd}
              dark={dark}
              showToast={showToast}
              plan={plan}
              completedCount={completedCount}
              streak={streak}
              pct={pct}
            />
          </div>
        )}

        {/* DASHBOARD VIEW */}
        {tab === "dashboard" && (
          <div style={{ animation: "fadeUp 0.3s forwards" }}>
            <Dashboard
              state={state}
              card={cardStyle}
              sectionLabel={sectionLabelStyle}
              mut={mut}
              fg={fg}
              brd={brd}
              dark={dark}
            />
          </div>
        )}

        {/* FASTING VIEW */}
        {tab === "fasting" && (
          <div style={{ animation: "fadeUp 0.3s forwards" }}>
            <FastingView
              state={state}
              setState={setState}
              card={cardStyle}
              sectionLabel={sectionLabelStyle}
              mut={mut}
              fg={fg}
              brd={brd}
              showToast={showToast}
            />
          </div>
        )}

        {/* JOURNAL VIEW */}
        {tab === "journal" && (
          <div style={{ animation: "fadeUp 0.3s forwards" }}>
            <JournalView
              state={state}
              addJournal={addJournal}
              card={cardStyle}
              sectionLabel={sectionLabelStyle}
              mut={mut}
              fg={fg}
              brd={brd}
              setState={setState}
            />
          </div>
        )}

        {/* PROFILE VIEW */}
        {tab === "profile" && (
          <div style={{ animation: "fadeUp 0.3s forwards" }}>
            <div style={{ ...cardStyle, textAlign: "center", marginBottom: 18 }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: C.gold,
                  color: C.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  fontWeight: W.thin,
                  margin: "0 auto 12px"
                }}
              >
                {(user?.name || "?")[0].toUpperCase()}
              </div>
              <div style={{ fontSize: 18, fontWeight: W.medium }}>{user?.name}</div>
              <div style={{ fontSize: 13, color: mut }}>{user?.email}</div>
            </div>
            <div className="rest-grid" style={{ marginBottom: 18 }}>
              <div style={{ ...cardStyle, textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: W.thin, color: C.gold }}>{streak}</div>
                <div style={{ fontSize: 12, color: mut }}>Reading Streak</div>
              </div>
              <div style={{ ...cardStyle, textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: W.thin, color: C.gold }}>{prayerStreak}</div>
                <div style={{ fontSize: 12, color: mut }}>Prayer Streak</div>
              </div>
              <div style={{ ...cardStyle, textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: W.thin, color: C.gold }}>{pct}%</div>
                <div style={{ fontSize: 12, color: mut }}>Reading Done</div>
              </div>
              <div style={{ ...cardStyle, textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: W.thin, color: C.gold }}>{prayerLifetimeHrs}</div>
                <div style={{ fontSize: 12, color: mut }}>Lifetime Prayer Hrs</div>
              </div>
              <div style={{ ...cardStyle, textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: W.thin, color: C.gold }}>{level.name}</div>
                <div style={{ fontSize: 12, color: mut }}>Challenge Level</div>
              </div>
              <div style={{ ...cardStyle, textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: W.regular, color: fg }}>
                  {plan ? PLAN_PRESETS.find(p => p.id === plan.presetId)?.name : "None"}
                </div>
                <div style={{ fontSize: 12, color: mut }}>Current Plan</div>
              </div>
            </div>

            {/* Combined App Themes & Sanctuaries */}
            <div style={{ ...cardStyle, marginBottom: 20, padding: "24px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ color: C.gold }}><Sparkles size={20} /></span>
                <span style={{ fontSize: 16, fontWeight: W.medium, color: fg, fontFamily: F }}>
                  Themes
                </span>
              </div>
              <p style={{ fontSize: 13, color: mut, lineHeight: "1.5", marginBottom: 24, fontFamily: F }}>
                Personalize your sacred environment. Select from individual Backdrop choices, or choose a custom Color Accent.
              </p>

              {/* Subsection: Sanctuary Landscapes (Atmospheres) */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 12, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" as any, color: C.gold, marginBottom: 14, fontFamily: F }}>
                  Backdrop
                </div>
                
                <div style={{ display: "flex", flexDirection: "column" as any, gap: 12, maxHeight: "380px", overflowY: "auto", paddingRight: "6px" }}>
                  {[
                    {
                      id: "plain_ambient",
                      name: "Plain Minimal Accent",
                      desc: "A clean plain background showing your selected Color Accent as a soft glowing halo at the top of the screen",
                      color: activeThemeColor,
                      badge: "Minimal"
                    },
                    {
                      id: "mountain_sunrise",
                      name: "1. Mountain Sunrise Sanctuary",
                      desc: "Majestic pines & foggy peaks bathed in radiant morning gold",
                      color: "#C5A367",
                      badge: "Option 1"
                    },
                    {
                      id: "deep_ocean",
                      name: "2. Deep Ocean Stillness",
                      desc: "A tranquil underwater marine state with beams of silent teal light",
                      color: "#3E92A3",
                      badge: "Option 2"
                    },
                    {
                      id: "throne_light",
                      name: "3. Throne Room Light",
                      desc: "A holy space of bright golden halos glowing in cosmic worship",
                      color: "#E5C269",
                      badge: "Option 3"
                    },
                    {
                      id: "cedars_lebanon",
                      name: "4. Cedars of Lebanon",
                      desc: "Towering green foliage bathed in gold beams of deep Sabbath light",
                      color: "#1E824C",
                      badge: "Option 4"
                    },
                    {
                      id: "sinai_ascent",
                      name: "5. Sinai Ascent",
                      desc: "Stretching desert sands and glowing peaks where the law was written",
                      color: "#D35400",
                      badge: "Option 5"
                    },
                    {
                      id: "evening_vespers",
                      name: "6. Evening Vespers",
                      desc: "Cool gothic arches backlit by warm lavender and amber candle glow",
                      color: "#8E44AD",
                      badge: "Option 6"
                    },
                    {
                      id: "tabor_glory",
                      name: "7. Tabor Glory",
                      desc: "High, luminous celestial cloudscapes illustrating the Transfiguration",
                      color: "#E05A47",
                      badge: "Option 7"
                    },
                    {
                      id: "gethsemane_olive",
                      name: "8. Gethsemane Olive Trees",
                      desc: "Cool, dew-laden shelter of olive boughs in night prayer",
                      color: "#58D68D",
                      badge: "Option 8"
                    },
                    {
                      id: "patmos_eclipse",
                      name: "9. Patmos Eclipse",
                      desc: "An infinite deep purple canvas of stars and holy revelation",
                      color: "#F1C40F",
                      badge: "Option 9"
                    },
                    {
                      id: "galilee_mist",
                      name: "10. Galilee Mist",
                      desc: "Glassy, mirroring early morning mist over a tranquil sacred lake",
                      color: "#3498DB",
                      badge: "Option 10"
                    },
                    {
                      id: "sharon_rose",
                      name: "11. Rose of Sharon Meadow",
                      desc: "Spring fields alive with morning dew and soft coral highlights",
                      color: "#EC7063",
                      badge: "Option 11"
                    },
                    {
                      id: "golden_altar",
                      name: "12. Golden Altar Lights",
                      desc: "Continuous soft columns of warm golden incense and candlelight",
                      color: "#D4AC0D",
                      badge: "Option 12"
                    },
                    {
                      id: "sabbath_rest",
                      name: "13. Sabbath Pinewood Sanctuary",
                      desc: "Filter out any earthly noise under a canopy of ancient quiet pines",
                      color: "#27AE60",
                      badge: "Option 13"
                    },
                    {
                      id: "eden_fountain",
                      name: "14. Eden Living Fountain",
                      desc: "Living water splashing gently on forest stone in pristine stillness",
                      color: "#1ABC9C",
                      badge: "Option 14"
                    },
                    {
                      id: "pneumas_breath",
                      name: "15. Pneuma's Gentle Breath",
                      desc: "Gentle breezes rolling over silent hills, whispering of the Spirit",
                      color: "#A2D9CE",
                      badge: "Option 15"
                    },
                    {
                      id: "glorious_ascent",
                      name: "16. Glorious Peak Sunrise",
                      desc: "Sun-pierced gold peaks rises above low clouds and canyons",
                      color: "#E67E22",
                      badge: "Option 16"
                    },
                    {
                      id: "stellar_sanctuary",
                      name: "17. Stellar Sanctuary Stars",
                      desc: "An infinite purple star canopy of interstellar nebulas praising God",
                      color: "#9B59B6",
                      badge: "Option 17"
                    },
                    {
                      id: "silicon_valley_vespers",
                      name: "18. Silicon Slate Sanctuary",
                      desc: "Silver geometric highlights and node maps on an endless slate grey void",
                      color: "#95A5A6",
                      badge: "Option 18"
                    }
                  ].map(opt => {
                    const active = backdropId === opt.id;
                    return (
                      <div 
                        key={opt.id}
                        style={{
                          padding: "12px 14px",
                          borderRadius: 12,
                          border: active ? `1px solid ${C.gold}` : `1px solid ${brd}`,
                          background: active ? (dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)") : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 16,
                          transition: "all 0.15s"
                        }}
                      >
                        <div style={{ flex: 1, textAlign: "left", display: "flex", alignItems: "flex-start", gap: 10 }}>
                          {/* Color preview circle indicator */}
                          <div style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: opt.color,
                            marginTop: 4,
                            flexShrink: 0,
                            boxShadow: `0 0 6px ${opt.color}80`
                          }} />
                          
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                              <span style={{ fontSize: 13, fontWeight: "600", color: active ? C.gold : fg, fontFamily: F }}>
                                {opt.name}
                              </span>
                            </div>
                            <p style={{ fontSize: 11, color: mut, margin: 0, lineHeight: 1.3 }}>
                              {opt.desc}
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => {
                            setState((s: any) => ({
                              ...s,
                              settings: {
                                ...(s.settings || {}),
                                backdropId: opt.id,
                                themeColor: opt.color
                              }
                            }));
                            showToast(`Activated ${opt.name}!`);
                          }}
                          style={{
                            flexShrink: 0,
                            padding: "6px 12px",
                            borderRadius: 8,
                            background: active ? "transparent" : C.gold,
                            border: `1px solid ${C.gold}`,
                            color: active ? C.gold : (dark ? "#0A0A0A" : "#FFFFFF"),
                            fontSize: 10,
                            fontWeight: "700",
                            fontFamily: F,
                            cursor: "pointer",
                            transition: "all 0.15s"
                          }}
                        >
                          {active ? "Active" : "Activate"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Subsection: Color Accents */}
              <div>
                <div style={{ fontSize: 12, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" as any, color: C.gold, marginBottom: 14, fontFamily: F }}>
                  Color Accents
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
                  {PALETTES.map(p => {
                    const active = activeThemeColor === p.hex;
                    return (
                      <button
                        key={p.name}
                        onClick={() => {
                          setState((s: any) => ({
                            ...s,
                            settings: { ...(s.settings || {}), themeColor: p.hex }
                          }));
                          showToast(`Theme accent changed to ${p.name}`);
                        }}
                        style={{
                          background: "transparent",
                          border: active ? `2px solid ${C.gold}` : `1px solid ${brd}`,
                          borderRadius: 12,
                          padding: "10px 8px",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 6,
                          boxShadow: active ? `0 2px 8px ${C.gold}22` : "none",
                          transition: "all 0.15s"
                        }}
                      >
                        <div style={{ width: 14, height: 14, borderRadius: "50%", background: p.hex, border: active ? "1px solid #FFFFFF" : "none" }} />
                        <div style={{ minWidth: 0, width: "100%", textAlign: "center" }}>
                          <div style={{ fontSize: 11, fontWeight: "600", color: fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: 9, color: mut, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {p.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                authAdapter.signOut();
                setUser(null);
              }}
              style={{ ...ghostBtnStyle(brd, fg), width: "100%", justifyContent: "center" }}
            >
              <LogOut size={14} /> Sign Out
            </button>
            <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: C.faint, lineHeight: 1.6 }}>
              <span style={{ fontFamily: F_thin, fontWeight: "100", color: C.gold, letterSpacing: 1.5 }}>{BRAND}</span> · {TAGLINE}
              <br />
              Install from browser menu for the offline app experience.
            </div>
          </div>
        )}
      </div>

      {/* Floating Ambient bottom mini playback bar */}
      {audio.track && (
        <div
          style={{
            position: "fixed",
            bottom: 74,
            left: 0,
            right: 0,
            zIndex: 80,
            background: dark ? "rgba(18, 18, 18, 0.92)" : "rgba(255, 255, 255, 0.92)",
            borderTop: `1px solid ${brd}`,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            maxWidth: 1280,
            margin: "0 auto"
          }}
        >
          <span style={{ color: audio.playing ? C.gold : mut }}>
            <Music size={14} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: W.medium, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>
              {audio.track.title}
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={audio.volume}
            onChange={e => audio.setVol(parseFloat(e.target.value))}
            style={{ width: 70, accentColor: C.gold }}
          />
          <button
            onClick={() => audio.toggle()}
            style={{
              background: "transparent",
              border: `1px solid ${brd}`,
              borderRadius: 8,
              padding: "5px 10px",
              cursor: "pointer",
              color: fg,
              fontFamily: F,
              fontSize: 11
            }}
          >
            {audio.playing ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => audio.stop()}
            style={{
              background: "transparent",
              border: `1px solid ${brd}`,
              borderRadius: 8,
              padding: "5px 10px",
              cursor: "pointer",
              color: mut,
              fontFamily: F,
              fontSize: 11
            }}
          >
            Stop
          </button>
        </div>
      )}

      {/* Persistent Elegant Bottom Tab Navigation Menu */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: dark ? "rgba(18, 18, 18, 0.95)" : "rgba(255, 255, 255, 0.95)",
          borderTop: `1px solid ${brd}`,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-around", maxWidth: 640, margin: "0 auto", padding: "8px 4px 18px" }}>
          {[
            { id: "home", label: "Home", icon: <Home size={18} /> },
            { id: "plan", label: "Reading", icon: <Book size={18} /> },
            { id: "prayer", label: "Prayer", icon: <Flame size={18} /> },
            { id: "meditate", label: "Meditation", icon: <Sparkles size={18} /> },
            { id: "more", label: "More", icon: <Menu size={18} /> }
          ].map(t => {
            const active = t.id === "more" ? showMoreMenu : (tab === t.id && !showMoreMenu);
            return (
              <button
                key={t.id}
                onClick={() => {
                  if (t.id === "more") {
                    setShowMoreMenu(true);
                  } else {
                    setShowMoreMenu(false);
                    setTab(t.id as any);
                  }
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                  color: active ? C.gold : mut,
                  fontFamily: F,
                  fontSize: 10,
                  padding: "4px 8px",
                  transition: "color 0.2s"
                }}
              >
                <div style={{ transition: "transform 0.2s", transform: active ? "scale(1.1)" : "scale(1)" }}>{t.icon}</div>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MORE MENU DRAW LAYER */}
      {showMoreMenu && (
        <div
          id="more-menu-overlay"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 600,
            background: dark ? "rgba(10, 10, 10, 0.96)" : "rgba(246, 244, 238, 0.97)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            overflowY: "auto",
            padding: "40px 24px 120px",
            animation: "fadeUp 0.25s ease-out forwards",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <div style={{ maxWidth: 600, width: "100%" }}>
            
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, borderBottom: `1px solid ${brd}`, paddingBottom: 16 }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 20, fontWeight: 300, color: fg, fontFamily: F, marginTop: 4 }}>More Options</div>
              </div>
              <button
                onClick={() => setShowMoreMenu(false)}
                style={{
                  background: "transparent",
                  border: `1px solid ${brd}`,
                  borderRadius: 12,
                  padding: "8px 16px",
                  color: fg,
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: F,
                  transition: "all 0.15s"
                }}
              >
                Close Menu
              </button>
            </div>

            {/* Grid list of converted items */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginBottom: 40 }}>
              {[
                { label: "Daily Journal", desc: "Reflect on scriptural prompts", icon: <MessageSquare size={16} />, id: "journal" },
                { label: "Analytics", desc: "Lifetime stats & growth levels", icon: <BarChart2 size={16} />, id: "dashboard" },
                { label: "Friends", desc: "Share blessings & daily reads", icon: <Users size={16} />, id: "friends" },
                { label: "Fasting", desc: "Scriptural fasting time keeper", icon: <Activity size={16} />, id: "fasting" },
                { label: "Profile", desc: "Streak details & sign-out", icon: <Users size={16} />, id: "profile" },
                { label: "Soaking Worship", desc: "Set background atmospheres", icon: <Music size={16} />, id: "audio" }
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => {
                    setShowMoreMenu(false);
                    if (item.id === "audio") {
                      setShowAudio(true);
                    } else {
                      setTab(item.id as any);
                    }
                  }}
                  style={{
                    background: surf,
                    border: `1.5px solid ${brd}`,
                    borderRadius: 18,
                    padding: 18,
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    transition: "all 0.15s"
                  }}
                >
                  <div style={{ color: C.gold, marginTop: 2 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: W.medium, color: fg }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: mut, marginTop: 2, lineHeight: 1.3 }}>{item.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* AMBIENT GLOW STYLE SELECTION */}
            <div style={{ borderTop: `1px solid ${brd}`, paddingTop: 32 }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 16, fontWeight: W.medium, color: fg }}>Ambient Glows</div>
                <div style={{ fontSize: 12, color: mut, marginTop: 4, fontFamily: F }}>
                  Choose a soft background glow style for your quiet sessions.
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                {BACKDROPS.map(b => {
                  const active = backdropId === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        setState((s: any) => ({
                          ...s,
                          settings: { ...(s.settings || {}), backdropId: b.id }
                        }));
                        showToast(`Glow pattern changed to ${b.name}`);
                      }}
                      style={{
                        background: surf,
                        border: active ? `2px solid ${C.gold}` : `1px solid ${brd}`,
                        borderRadius: 18,
                        padding: "16px 14px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        textAlign: "left",
                        boxShadow: active ? `0 4px 12px ${C.gold}22` : "none",
                        transition: "all 0.15s"
                      }}
                    >
                      {/* Mini illustrative thumbnail of the backdrop (scenics) */}
                      <div style={{
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        background: active ? `${C.gold}1C` : "rgba(255,255,255,0.02)",
                        border: `1px solid ${active ? C.gold : brd}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}>
                        <Sparkles size={16} style={{ color: active ? C.gold : mut, opacity: active ? 1 : 0.6 }} />
                      </div>
                      
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: "600", color: fg, display: "flex", alignItems: "center", gap: 4 }}>
                          {b.name}
                          {active && <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.gold }} />}
                        </div>
                        <div style={{ fontSize: 10, color: mut, marginTop: 2, lineHeight: 1.2 }}>
                          {b.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
export type { App };
