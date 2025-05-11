'use client'
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faGithub, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const svgRef = useRef(null);
  const pathsRef = useRef([]);

  useEffect(() => {
    setIsLoaded(true);
    
    if (svgRef.current && pathsRef.current.length > 0) {
      pathsRef.current.forEach(path => {
        if (path && typeof path.getTotalLength === 'function') {
          const length = path.getTotalLength();
          gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length,
            opacity: 1,
          });
        }
      });

      const tl = gsap.timeline();
      
      pathsRef.current.forEach((path, index) => {
        if (path) {
          tl.to(path, {
            strokeDashoffset: 0,
            duration: 3.0, // <--- INCREASED DURATION for slower drawing of each path
            ease: "power2.out",
          }, index * 0.5); // <--- ADJUSTED STAGGER for slower overall sequence
        }
      });

      tl.to(pathsRef.current, {
        fill: "#603E2B",
        duration: 1, // Optional: Slightly increase fill duration if desired
        ease: "power2.inOut",
        delay: 0 // Delay after all paths are drawn (relative to the end of the last stroke animation)
      });
    }
  }, [isLoaded]); // Re-run if isLoaded changes, though primarily for initial setup

  // Function to add paths to the refs array
  const addPathRef = (el) => {
    if (el && !pathsRef.current.includes(el)) {
      pathsRef.current.push(el);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10 opacity-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 opacity-70" />
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-amber-200 opacity-20 animate-float1" />
          <div className="absolute top-40 right-40 w-24 h-24 rounded-full bg-orange-200 opacity-30 animate-float2" />
          <div className="absolute bottom-20 left-1/3 w-40 h-40 rounded-full bg-amber-100 opacity-25 animate-float3" />
          <svg className="h-full w-full" viewBox="0 0 800 800">
            <defs>
              <pattern id="dotPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1.5" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotPattern)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-4">
          <div 
            className={`mx-auto max-w-3xl text-center transition-all duration-1000 ease-out ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {/* SVG Logo with GSAP animation */}
            <div className="pb-2 flex justify-center">
              <div className="drop-shadow-lg w-full max-w-md"> {/* Adjust max-w-md as needed for new logo size */}
                <svg 
                  ref={svgRef}
                  version="1.0" 
                  xmlns="http://www.w3.org/2000/svg"
                  width="100%" // Let the container control the width
                  height="100%" // Let the container control the height
                  viewBox="0 0 1024 420" // Adjusted viewBox from your SVG
                  preserveAspectRatio="xMidYMid meet"
                  className="w-full" // Ensures it takes the width of the parent div
                >
                  {/* DOCTYPE and xml declaration are not part of JSX for SVG */}
                  <g transform="translate(0.000000,420.000000) scale(0.100000,-0.100000)"
                     /* fill="#000000" // Fill will be handled by GSAP on paths
                     stroke="none" // Stroke will be handled by GSAP on paths */
                  >
                    <path 
                      ref={addPathRef}
                      stroke="#000000" 
                      strokeWidth="5"  // Adjust for desired drawing thickness
                      fill="transparent"
                      d="M1812 3521 c-7 -4 -35 -6 -62 -3 -27 2 -71 -1 -97 -8 -27 -7 -73 -16 -103 -21 -112 -17 -265 -58 -375 -100 -28 -10 -57 -19 -66 -19 -8 0 -40 -15 -70 -33 -30 -18 -70 -39 -89 -46 -19 -8 -46 -24 -60 -36 -14 -13 -36 -26 -50 -30 -14 -4 -39 -20 -57 -36 -17 -15 -61 -44 -97 -64 -36 -20 -66 -41 -66 -46 0 -4 -27 -36 -60 -70 -33 -34 -60 -66 -60 -71 0 -6 -11 -23 -25 -40 -14 -16 -25 -35 -25 -42 0 -6 -5 -17 -12 -24 -43 -43 -43 -160 1 -198 29 -25 126 -64 160 -64 12 0 33 -7 47 -16 22 -15 35 -16 104 -6 44 6 87 9 95 5 9 -3 26 4 39 16 20 18 27 20 51 11 23 -9 30 -8 37 4 6 11 18 14 37 10 17 -4 43 1 63 10 24 12 42 14 58 8 l24 -9 -22 -12 c-15 -8 -22 -21 -22 -42 0 -21 -6 -32 -18 -36 -10 -2 -22 -12 -27 -22 -32 -56 -56 -114 -52 -124 2 -6 -6 -16 -17 -22 -12 -6 -23 -22 -24 -35 -2 -14 -9 -31 -14 -38 -10 -12 -34 -53 -60 -102 -7 -14 -15 -27 -19 -30 -11 -10 -48 -85 -59 -122 -6 -21 -16 -40 -21 -44 -5 -3 -25 -37 -45 -76 -25 -50 -34 -78 -29 -95 l6 -25 -60 7 c-56 6 -62 5 -86 -19 -32 -32 -33 -75 -1 -113 56 -67 291 -84 521 -38 47 9 88 23 100 35 13 12 25 16 31 11 5 -5 32 -11 59 -13 44 -3 50 -1 53 18 2 17 10 21 50 21 73 1 118 7 133 19 8 6 36 14 63 18 27 3 68 17 90 30 23 13 60 27 84 31 26 4 46 14 53 26 5 11 14 17 19 14 11 -7 93 35 172 87 15 10 33 18 41 18 24 0 320 256 385 334 65 78 142 202 142 228 0 9 7 21 15 28 8 7 15 29 15 49 0 20 5 52 11 71 6 19 10 83 10 142 0 86 -5 123 -26 193 -42 136 -72 192 -147 271 -59 62 -203 174 -226 174 -4 0 -18 9 -32 20 -14 11 -37 20 -51 20 -15 0 -32 7 -39 15 -7 8 -25 15 -41 15 -15 0 -65 9 -111 20 -90 22 -126 24 -146 11z m83 -136 c62 -7 196 -57 273 -102 56 -33 160 -134 155 -150 -3 -7 5 -29 17 -48 14 -23 24 -58 27 -98 2 -34 9 -72 15 -83 7 -16 7 -32 -1 -57 -9 -25 -9 -42 -2 -55 5 -10 7 -29 4 -40 -3 -12 0 -29 7 -37 10 -13 8 -19 -13 -35 -23 -19 -25 -26 -20 -68 5 -44 3 -50 -21 -65 -18 -12 -26 -26 -26 -46 0 -16 -6 -31 -15 -35 -9 -3 -15 -18 -15 -36 0 -17 -5 -30 -12 -30 -7 0 -28 -25 -47 -55 -18 -30 -42 -57 -52 -60 -11 -4 -33 -24 -51 -46 -17 -21 -37 -39 -44 -39 -7 0 -26 -11 -42 -25 -17 -14 -45 -32 -64 -39 -18 -8 -44 -26 -57 -40 -14 -14 -31 -26 -38 -26 -8 0 -50 -20 -94 -45 -102 -58 -271 -126 -328 -131 -25 -3 -50 -9 -57 -15 -7 -6 -18 -8 -24 -4 -5 3 -13 0 -16 -8 -3 -8 -15 -15 -27 -15 -12 0 -53 -6 -92 -12 -38 -6 -88 -12 -110 -14 -22 -1 -57 -6 -77 -11 -21 -4 -38 -3 -38 2 0 4 27 62 60 128 34 66 81 167 106 225 25 58 67 138 95 178 27 40 49 82 49 93 0 12 9 33 19 48 10 14 37 65 59 113 39 84 42 87 79 93 21 3 54 10 74 15 20 6 48 10 62 10 14 0 58 12 97 26 39 14 76 24 83 21 6 -2 18 3 25 10 9 9 25 11 48 7 20 -4 64 1 106 11 181 44 292 138 262 224 -15 42 -54 49 -115 20 -29 -13 -64 -35 -78 -49 -39 -38 -122 -92 -135 -87 -14 5 -120 -21 -233 -58 -55 -17 -98 -25 -131 -23 l-50 3 31 75 c56 138 39 232 -56 301 -51 37 -120 41 -138 8 -12 -24 -4 -100 14 -132 9 -15 9 -21 -1 -24 -9 -3 -11 -16 -6 -39 5 -27 3 -34 -10 -34 -22 0 -42 -37 -50 -90 -4 -24 -18 -59 -31 -76 -14 -18 -25 -41 -25 -52 0 -11 -8 -23 -17 -27 -30 -12 -175 -46 -232 -54 -37 -5 -59 -14 -72 -29 -21 -27 -29 -28 -29 -2 0 23 -8 24 -60 9 -46 -14 -154 2 -181 27 -10 9 -23 32 -29 50 -15 44 9 96 80 180 110 129 148 162 270 228 25 13 54 33 64 45 11 12 27 21 38 21 10 0 36 11 58 25 22 14 61 32 87 41 27 9 55 22 64 30 8 8 28 14 43 14 14 0 55 10 89 22 147 51 313 65 502 43z"
                    />
                    <path
                      ref={addPathRef}
                      stroke="#000000" 
                      strokeWidth="5"
                      fill="transparent"
                      d="M8196 3403 c-29 -27 -64 -66 -76 -88 -13 -22 -39 -59 -59 -81 -20 -23 -45 -57 -56 -75 -15 -25 -30 -35 -55 -40 -19 -4 -52 -14 -74 -23 -21 -10 -52 -19 -70 -20 -17 -2 -38 -6 -46 -9 -8 -3 -35 -8 -60 -10 -42 -5 -94 -17 -215 -51 -27 -8 -84 -22 -125 -32 -41 -9 -87 -23 -101 -30 -14 -7 -39 -12 -55 -12 -17 1 -39 -4 -51 -11 -37 -19 -40 -13 -26 44 14 53 13 59 -7 101 -32 65 -60 81 -118 65 -25 -7 -52 -16 -58 -22 -35 -29 -21 -160 21 -199 l24 -22 -49 -25 c-90 -45 -121 -123 -81 -201 12 -23 29 -42 37 -42 9 0 34 14 56 31 38 31 176 79 225 79 12 0 40 6 60 14 21 7 67 19 103 25 36 7 85 21 109 32 25 11 88 25 140 31 69 8 102 17 118 31 14 13 30 18 44 14 12 -3 35 1 51 9 65 34 61 -7 -15 -145 -41 -74 -77 -120 -169 -216 -65 -68 -118 -127 -118 -133 0 -5 -18 -22 -40 -37 -22 -15 -42 -35 -46 -44 -3 -9 -34 -41 -69 -71 -34 -30 -68 -64 -74 -75 -7 -11 -23 -27 -36 -35 -13 -8 -81 -61 -152 -116 -71 -56 -156 -115 -189 -132 -33 -17 -66 -37 -73 -46 -9 -11 -29 -16 -60 -15 -25 0 -40 3 -33 6 7 2 12 22 12 44 0 22 5 50 12 62 7 12 11 32 9 43 -1 12 7 37 18 55 11 19 27 46 36 62 21 37 67 246 59 270 -9 27 -63 86 -95 103 -42 21 -71 17 -115 -16 -21 -16 -42 -30 -45 -30 -4 0 -29 -20 -55 -45 -27 -25 -57 -45 -67 -45 -20 0 -135 -79 -176 -121 -14 -15 -44 -38 -66 -51 -22 -14 -77 -56 -122 -94 -104 -88 -130 -107 -170 -128 -32 -16 -52 -8 -37 16 21 34 45 234 32 268 -5 14 -14 52 -19 86 -10 69 -48 189 -75 235 -28 46 -68 73 -110 72 -48 -1 -69 -24 -95 -102 -22 -67 -85 -168 -143 -229 -17 -18 -63 -58 -103 -89 -39 -30 -74 -61 -77 -69 -3 -8 -15 -14 -27 -14 -20 0 -38 -12 -112 -71 -18 -14 -51 -37 -75 -51 -41 -24 -92 -84 -92 -108 0 -7 -8 -9 -19 -5 -14 4 -31 -7 -67 -45 -45 -47 -110 -80 -124 -62 -3 4 -17 31 -30 60 -19 43 -22 57 -12 70 25 35 30 61 37 194 l7 136 -28 52 c-50 93 -114 125 -197 100 -97 -29 -267 -121 -293 -159 -8 -10 -31 -26 -53 -34 -21 -9 -48 -28 -60 -43 -30 -38 -89 -77 -107 -70 -12 5 -12 11 2 46 50 124 -35 283 -152 284 -44 1 -49 -2 -78 -41 -29 -41 -95 -93 -117 -93 -5 0 -21 -7 -34 -16 -21 -14 -40 -20 -67 -23 -4 -1 -29 -22 -56 -48 -27 -27 -60 -56 -72 -66 -12 -10 -19 -25 -16 -32 3 -8 1 -17 -4 -20 -6 -4 -10 1 -10 9 0 23 -8 20 -58 -21 -47 -41 -96 -72 -151 -98 -19 -8 -41 -24 -48 -35 -8 -11 -22 -20 -31 -20 -9 0 -34 -16 -55 -35 -21 -19 -44 -35 -52 -35 -7 0 -26 -11 -42 -24 -16 -13 -47 -28 -68 -32 -22 -4 -54 -13 -72 -20 -17 -8 -63 -17 -102 -20 -57 -6 -75 -4 -97 10 -23 16 -25 22 -19 54 10 62 15 70 43 81 54 22 107 59 120 85 8 15 21 26 33 26 21 0 129 76 129 92 0 5 15 15 34 23 18 8 41 26 50 40 12 19 24 25 37 22 19 -5 137 71 197 126 84 78 63 176 -43 200 -59 13 -170 14 -240 3 -119 -20 -293 -131 -310 -197 -4 -16 -19 -32 -40 -42 -28 -13 -43 -34 -79 -105 -24 -48 -49 -107 -55 -130 -7 -23 -23 -54 -37 -69 -52 -56 -58 -112 -16 -142 18 -13 34 -38 45 -75 10 -31 24 -56 31 -56 8 0 19 -14 26 -31 20 -46 86 -73 167 -65 36 3 65 1 68 -4 4 -6 16 -10 29 -10 27 0 158 47 246 89 36 17 71 31 77 31 7 0 20 12 30 28 21 33 33 42 56 42 23 0 97 49 97 65 0 21 25 36 38 23 8 -8 28 6 79 58 74 76 108 104 123 104 6 0 10 6 10 13 0 13 87 72 107 72 6 0 22 9 35 20 38 34 88 66 88 58 0 -4 -14 -35 -30 -68 -16 -33 -30 -68 -30 -78 0 -10 -7 -20 -15 -23 -23 -9 -95 -85 -95 -100 0 -7 -9 -18 -21 -24 -41 -23 -71 -158 -49 -225 13 -39 62 -85 91 -85 10 0 38 18 60 40 23 22 47 40 55 40 7 0 15 9 19 19 3 11 16 21 28 23 14 2 28 17 40 41 15 32 20 36 37 27 15 -8 25 -5 48 17 16 16 33 38 36 50 4 12 16 25 27 28 11 4 74 53 140 110 92 80 143 116 223 156 63 32 110 49 120 46 15 -6 17 -24 15 -139 -1 -160 5 -263 20 -301 6 -16 25 -49 42 -74 59 -86 181 -110 270 -53 26 17 50 37 53 45 3 8 15 15 26 15 11 0 24 8 28 19 8 21 81 85 121 106 14 7 57 46 95 85 39 39 117 108 175 153 112 85 167 133 210 182 14 16 48 51 76 78 46 44 51 46 63 30 20 -28 13 -252 -9 -264 -9 -4 -19 -26 -23 -49 -3 -22 -21 -59 -39 -83 -18 -24 -39 -58 -46 -75 -19 -47 -92 -86 -143 -78 -22 4 -50 13 -63 22 -21 14 -29 13 -88 -6 -54 -18 -71 -29 -101 -67 -35 -45 -35 -46 -18 -76 34 -60 103 -126 140 -137 67 -18 111 -12 178 25 34 19 69 35 78 35 9 0 47 18 84 41 37 22 82 47 100 54 17 8 32 19 32 24 0 6 19 15 42 22 38 10 94 41 108 60 3 3 15 11 28 18 12 6 22 18 22 25 0 8 10 17 23 20 12 3 46 28 75 55 29 28 62 53 72 56 11 3 46 32 79 65 32 32 68 61 78 64 21 7 93 74 93 87 0 5 10 9 22 9 11 0 36 11 53 24 20 16 40 23 52 20 12 -3 24 -1 27 5 4 6 16 11 28 11 15 0 19 -5 15 -17 -17 -53 -40 -108 -52 -127 -8 -11 -15 -27 -15 -36 0 -8 -6 -26 -13 -40 -25 -48 -50 -177 -43 -222 21 -148 22 -151 55 -180 38 -34 102 -38 159 -9 20 10 66 33 102 52 66 33 107 62 189 135 47 41 183 146 227 175 13 8 48 41 79 72 30 31 59 57 65 57 6 0 15 11 20 25 5 14 15 25 22 25 17 0 106 81 130 118 10 15 21 27 26 27 4 0 26 17 48 37 21 21 43 38 48 38 6 0 5 -5 -2 -12 -7 -7 -12 -22 -12 -35 0 -12 -9 -56 -20 -96 -17 -62 -20 -97 -17 -242 3 -157 5 -176 32 -254 35 -103 76 -151 127 -151 51 0 76 32 84 107 9 79 -8 144 -52 209 -41 60 -50 125 -33 232 17 107 26 163 34 217 18 129 93 264 202 365 33 30 76 84 96 120 89 156 72 144 302 198 l130 31 18 -25 c33 -42 61 -30 133 61 46 57 84 127 84 154 0 36 -24 44 -92 32 -34 -6 -66 -15 -72 -21 -5 -5 -24 -10 -41 -10 -18 0 -58 -9 -91 -20 -32 -12 -68 -20 -79 -19 -11 1 -33 -1 -49 -6 -38 -10 -44 3 -34 77 12 92 -19 188 -62 188 -11 0 -44 -21 -74 -47z m-5016 -1049 c0 -8 -4 -14 -9 -14 -5 0 -39 -26 -77 -58 -156 -130 -285 -214 -302 -197 -7 6 36 107 56 130 25 30 141 109 187 127 52 20 117 35 133 30 6 -2 12 -10 12 -18z"
                    />
                    <path 
                      ref={addPathRef}
                      stroke="#000000" 
                      strokeWidth="5"
                      fill="transparent"
                      d="M8534 2414 c-21 -14 -52 -38 -69 -53 -16 -16 -40 -34 -51 -42 -12 -8 -68 -58 -125 -111 -57 -53 -116 -106 -131 -118 -16 -12 -28 -29 -28 -38 1 -21 55 -82 73 -82 15 0 77 61 77 76 0 15 39 49 46 41 3 -3 -3 -33 -15 -66 -12 -34 -21 -77 -21 -96 0 -19 -5 -43 -11 -53 -8 -12 -9 -36 -5 -67 8 -49 34 -83 87 -110 36 -19 128 -6 156 22 13 13 29 19 40 17 20 -6 107 40 182 94 24 18 50 32 58 32 26 0 69 28 83 54 7 14 22 26 32 26 30 0 78 29 78 46 0 12 6 15 25 10 24 -6 79 14 87 32 7 18 79 53 96 48 11 -4 29 2 45 14 14 11 28 20 31 20 11 0 6 -42 -8 -73 -8 -18 -33 -84 -55 -147 -22 -63 -51 -137 -65 -165 -15 -29 -26 -68 -26 -92 0 -24 -5 -43 -10 -43 -15 0 -51 -88 -48 -114 2 -15 -2 -20 -14 -18 -12 2 -20 -6 -24 -23 -8 -33 -69 -85 -99 -85 -17 0 -29 -9 -40 -30 -9 -16 -22 -30 -30 -30 -8 0 -22 -11 -31 -25 -9 -14 -20 -25 -24 -25 -17 0 -190 -155 -211 -189 -9 -14 -29 -37 -44 -51 -15 -14 -33 -40 -40 -58 -8 -17 -21 -32 -29 -32 -9 0 -16 -5 -16 -12 0 -7 -35 -64 -78 -128 -99 -145 -175 -289 -192 -360 -7 -30 -17 -67 -22 -82 -6 -15 -7 -50 -3 -79 9 -65 49 -111 137 -158 84 -45 120 -40 194 31 30 28 54 58 54 67 0 9 15 23 33 31 25 12 31 20 29 41 -2 20 4 28 30 40 25 11 33 20 33 40 1 15 15 43 33 63 18 20 40 49 49 64 10 15 23 33 30 40 7 7 13 21 13 29 0 9 18 40 40 69 58 77 91 142 84 169 -3 14 0 24 9 28 20 7 80 97 81 122 2 27 25 74 53 108 13 17 23 42 23 61 0 20 15 58 40 99 22 36 40 70 40 76 0 5 11 22 24 38 14 16 28 41 31 56 9 33 14 37 84 55 205 52 327 41 350 -31 16 -49 84 -109 119 -105 32 4 43 39 35 112 -8 66 -54 114 -137 140 -50 16 -70 17 -154 8 -53 -6 -117 -17 -142 -26 -51 -18 -100 -21 -100 -6 0 6 11 38 25 72 14 34 25 66 25 72 0 6 17 47 39 91 59 121 71 153 71 182 0 15 6 34 13 42 7 9 19 45 26 80 7 36 21 81 31 100 10 20 21 70 25 112 8 87 -4 118 -58 146 -65 33 -107 20 -245 -74 -26 -18 -90 -59 -143 -92 -53 -34 -103 -69 -113 -80 -10 -11 -32 -25 -49 -32 -18 -6 -52 -29 -77 -49 -25 -20 -74 -51 -110 -69 -36 -18 -69 -37 -75 -44 -5 -7 -44 -29 -86 -50 -73 -36 -109 -40 -109 -13 0 20 75 167 114 225 20 29 36 59 36 66 0 6 11 33 24 58 34 63 43 130 22 162 -23 35 -79 34 -132 -1z m368 -1257 c-6 -7 -40 -70 -76 -142 -37 -71 -73 -135 -81 -141 -8 -6 -15 -18 -15 -26 0 -19 -90 -192 -150 -288 -28 -44 -50 -84 -50 -90 0 -5 -11 -22 -25 -37 -14 -16 -36 -41 -50 -56 -14 -15 -25 -32 -25 -37 0 -26 -102 -110 -135 -110 -8 0 -5 52 4 75 5 11 4 25 -1 32 -7 8 -2 29 15 65 13 29 28 64 32 76 4 13 20 45 36 71 16 26 32 65 36 87 3 21 12 44 21 51 8 7 22 23 31 36 9 13 30 43 48 67 26 33 31 48 26 72 -5 27 -4 30 15 24 17 -6 26 -1 40 24 27 43 180 200 249 255 53 41 58 43 61 25 2 -12 -1 -26 -6 -33z"
                    />
                  </g>
                </svg>
              </div>
            </div>
            
            <p className={`mt-4 text-xl md:text-2xl font-medium text-muted-foreground transition-all delay-100 duration-1000 ease-out ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}>
              Densify Your Thoughts. Amplify Your Reach.
            </p>
            
            <p className={`mt-6 text-lg leading-8 text-muted-foreground transition-all delay-200 duration-1000 ease-out ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}>
              Express yourself through elegant writing, build an audience, 
              and join a community of thoughtful readers and creators.
            </p>
            
            <div className={`mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 transition-all delay-300 duration-1000 ease-out ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}>
              <Button 
                asChild 
                size="lg" 
                className="rounded-full px-8 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
              >
                <Link href="/create-post">Start Writing</Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                asChild 
                className="rounded-full px-8 hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1"
              >
                <Link href="/posts">Explore Posts</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Add some subtle paper decoration elements */}
      <div className="absolute top-20 right-10 w-32 h-40 bg-white rounded-sm opacity-10 rotate-12 hidden md:block" />
      <div className="absolute bottom-20 left-10 w-24 h-32 bg-white rounded-sm opacity-10 -rotate-6 hidden md:block" />
      <Separator className="my-5" />
      <footer className="py-8 bg-background text-center text-muted-foreground mt-auto">
        <p className="mb-2 text-lg font-semibold">Made by Sagnik Goswami</p>
        <p className="mb-4 text-sm">Let's connect:</p>
        <div className="flex justify-center space-x-6">
          <a
            href={"https://www.linkedin.com/in/sagnikgos06"}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn profile of Sagnik Goswami"
            className="text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faLinkedin} size="2x" />
          </a>
          <a
            href={"https://github.com/SagnikGos"}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile of Sagnik Goswami"
            className="text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faGithub} size="2x" />
          </a>
          <a
            href={"https://x.com/SagnikGos"}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter) profile of Sagnik Goswami"
            className="text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faXTwitter} size="2x" />
          </a>
        </div>
      </footer>
    </div>
  );
}