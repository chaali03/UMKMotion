import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Dot {
  cx: string;
  cy: string;
  isActive: boolean;
  id: number;
}

const CxCyValue = [
  { cx: "0.857851", cy: "156.033" },
  { cx: "9.43598", cy: "147.454" },
  { cx: "18.0141", cy: "147.454" },
  { cx: "18.0141", cy: "138.874" },
  { cx: "35.1704", cy: "130.295" },
  { cx: "43.7485", cy: "130.295" },
  { cx: "69.4868", cy: "147.454" },
  { cx: "69.4868", cy: "156.033" },
  { cx: "78.9243", cy: "156.033" },
  { cx: "78.0649", cy: "138.875" },
  { cx: "86.643", cy: "138.874" },
  { cx: "95.2211", cy: "138.875" },
  { cx: "95.2211", cy: "130.295" },
  { cx: "103.799", cy: "147.454" },
  { cx: "112.377", cy: "138.874" },
  { cx: "120.959", cy: "130.295" },
  { cx: "120.959", cy: "121.716" },
  { cx: "112.377", cy: "113.137" },
  { cx: "103.799", cy: "104.557" },
  { cx: "95.2211", cy: "95.978" },
  { cx: "120.959", cy: "104.557" },
  { cx: "120.959", cy: "95.1201" },
  { cx: "120.959", cy: "87.3989" },
  { cx: "129.534", cy: "95.978" },
  { cx: "155.272", cy: "130.295" },
  { cx: "163.85", cy: "130.295" },
  { cx: "163.85", cy: "138.875" },
  { cx: "163.85", cy: "147.454" },
  { cx: "172.428", cy: "147.454" },
  { cx: "172.428", cy: "138.874" },
  { cx: "172.428", cy: "121.716" },
  { cx: "172.428", cy: "113.137" },
  { cx: "181.006", cy: "121.716" },
  { cx: "189.584", cy: "121.716" },
  { cx: "189.584", cy: "104.557" },
  { cx: "198.163", cy: "104.557" },
  { cx: "189.584", cy: "95.978" },
  { cx: "172.428", cy: "95.978" },
  { cx: "172.428", cy: "87.3989" },
  { cx: "189.584", cy: "87.3989" },
  { cx: "198.163", cy: "78.8194" },
  { cx: "198.163", cy: "70.2402" },
  { cx: "198.163", cy: "61.6611" },
  { cx: "206.741", cy: "53.082" },
  { cx: "215.319", cy: "53.082" },
  { cx: "206.741", cy: "44.5025" },
  { cx: "197.307", cy: "35.9234" },
  { cx: "198.163", cy: "28.2022" },
  { cx: "206.741", cy: "18.7652" },
  { cx: "206.741", cy: "10.1856" },
  { cx: "215.319", cy: "18.7652" },
  { cx: "215.319", cy: "27.3443" },
  { cx: "223.897", cy: "27.3443" },
  { cx: "223.897", cy: "18.7652" },
  { cx: "223.897", cy: "53.082" },
  { cx: "232.479", cy: "53.082" },
  { cx: "259.928", cy: "35.9234" },
  { cx: "268.506", cy: "44.5025" },
  { cx: "277.944", cy: "44.5025" },
  { cx: "302.823", cy: "27.3443" },
  { cx: "311.401", cy: "35.9234" },
  { cx: "319.979", cy: "44.5025" },
  { cx: "302.823", cy: "53.082" },
  { cx: "294.241", cy: "52.2241" },
  { cx: "302.823", cy: "61.6611" },
  { cx: "311.401", cy: "70.2402" },
  { cx: "319.979", cy: "70.2402" },
  { cx: "328.557", cy: "70.2402" },
  { cx: "319.979", cy: "78.8198" },
  { cx: "320.834", cy: "87.3989" },
  { cx: "328.557", cy: "87.3989" },
  { cx: "337.135", cy: "86.541" },
  { cx: "346.573", cy: "87.3989" },
  { cx: "354.291", cy: "78.8194" },
  { cx: "363.729", cy: "78.8194" },
  { cx: "363.729", cy: "87.3989" },
  { cx: "328.557", cy: "95.978" },
  { cx: "328.557", cy: "105.415" },
  { cx: "337.995", cy: "121.716" },
  { cx: "328.557", cy: "130.295" },
  { cx: "319.979", cy: "130.295" },
  { cx: "319.979", cy: "138.875" },
  { cx: "319.979", cy: "148.312" },
  { cx: "345.713", cy: "147.454" },
  { cx: "355.151", cy: "147.454" },
  { cx: "354.291", cy: "138.874" },
  { cx: "346.573", cy: "138.874" },
  { cx: "355.151", cy: "130.295" },
  { cx: "345.713", cy: "121.716" },
  { cx: "363.729", cy: "131.153" },
  { cx: "389.463", cy: "95.978" },
  { cx: "397.186", cy: "88.2569" },
  { cx: "397.186", cy: "96.836" },
  { cx: "397.186", cy: "104.557" },
  { cx: "405.764", cy: "113.136" },
  { cx: "415.202", cy: "105.415" },
  { cx: "423.78", cy: "95.978" },
  { cx: "423.78", cy: "78.8198" },
  { cx: "397.186", cy: "121.716" },
  { cx: "398.045", cy: "130.295" },
  { cx: "405.764", cy: "139.732" },
  { cx: "422.92", cy: "139.732" },
  { cx: "431.498", cy: "138.875" },
  { cx: "440.077", cy: "139.732" },
  { cx: "449.514", cy: "148.312" },
  { cx: "450.373", cy: "156.033" },
  { cx: "440.077", cy: "156.033" },
  { cx: "475.248", cy: "131.153" },
  { cx: "483.827", cy: "130.295" },
  { cx: "500.127", cy: "138.874" },
  { cx: "500.983", cy: "147.454" },
  { cx: "510.42", cy: "147.454" },
  { cx: "518.143", cy: "156.033" },
  { cx: "423.78", cy: "130.295" },
  { cx: "415.202", cy: "148.312" },
  { cx: "414.342", cy: "156.891" },
  { cx: "405.764", cy: "156.033" },
  { cx: "398.045", cy: "156.033" },
  { cx: "328.557", cy: "53.082" },
  { cx: "337.995", cy: "60.8032" },
  { cx: "355.151", cy: "62.5191" },
  { cx: "354.291", cy: "53.082" },
  { cx: "277.944", cy: "35.9234" },
  { cx: "277.944", cy: "27.3443" },
  { cx: "277.944", cy: "18.7652" },
  { cx: "285.663", cy: "10.1856" },
  { cx: "286.522", cy: "1.60646" },
  { cx: "294.241", cy: "1.60646" },
  { cx: "295.1", cy: "10.1856" },
  { cx: "303.678", cy: "1.60646" },
  { cx: "311.401", cy: "10.1856" },
  { cx: "259.928", cy: "1.60646" },
  { cx: "189.584", cy: "70.2402" },
  { cx: "172.428", cy: "78.8194" },
  { cx: "155.272", cy: "78.8194" },
  { cx: "163.85", cy: "70.2402" },
  { cx: "154.413", cy: "53.082" },
  { cx: "163.85", cy: "53.082" },
  { cx: "163.85", cy: "44.5025" },
  { cx: "163.85", cy: "35.9234" },
  { cx: "172.428", cy: "44.5025" },
  { cx: "181.006", cy: "44.5025" },
  { cx: "189.584", cy: "130.295" },
  { cx: "198.163", cy: "130.295" },
  { cx: "198.163", cy: "138.874" },
  { cx: "198.163", cy: "148.312" },
  { cx: "103.799", cy: "156.033" },
  { cx: "112.377", cy: "156.033" },
  { cx: "120.959", cy: "156.033" },
];

const AnimatedDots = ({
  dotArr = CxCyValue,
  className,
}: {
  dotArr?: { cx: string; cy: string }[];
  className?: string;
}) => {
  const [dots, setDots] = useState<Dot[]>([]);
  const [activeDotGroups, setActiveDotGroups] = useState<number[][]>([]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);

  useEffect(() => {
    const initialDots = dotArr.map((dot, index) => ({
      cx: dot?.cx || "",
      cy: dot?.cy || "",
      isActive: false,
      id: index,
    }));

    setDots(initialDots);

    const numDots = initialDots.length;
    const numGroups = 15;

    const groups: number[][] = [];
    for (let i = 0; i < numGroups; i++) {
      const groupSize = Math.floor(Math.random() * 5) + 1;
      const group: number[] = [];

      for (let j = 0; j < groupSize; j++) {
        const dotId = Math.floor(Math.random() * numDots);
        if (!group.includes(dotId)) {
          group.push(dotId);
        }
      }

      groups.push(group);
    }

    setActiveDotGroups(groups);
  }, [dotArr]);

  useEffect(() => {
    if (activeDotGroups.length === 0) return;

    const animationInterval = setInterval(() => {
      setDots((prevDots) =>
        prevDots.map((dot) => ({ ...dot, isActive: false }))
      );

      setDots((prevDots) => {
        const newDots = [...prevDots];
        activeDotGroups[currentGroupIndex].forEach((dotId) => {
          if (dotId < newDots.length) {
            newDots[dotId] = { ...newDots[dotId], isActive: true };
          }
        });
        return newDots;
      });

      setCurrentGroupIndex((prev) => (prev + 1) % activeDotGroups.length);
    }, 1000);

    return () => clearInterval(animationInterval);
  }, [activeDotGroups, currentGroupIndex]);

  return (
    <svg
      width="519"
      height="158"
      viewBox="0 0 519 158"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("max-w-fit", className)}
    >
      {dots.map((dot, index) => (
        <motion.ellipse
          key={index}
          cx={dot.cx}
          cy={dot.cy}
          rx="0.857851"
          ry="0.857924"
          initial={{ fill: "#e5e7eb" }}
          animate={{
            fill: dot.isActive ? "#f97316" : "#e5e7eb",
            scale: dot.isActive ? 1.5 : 1,
          }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
        />
      ))}
    </svg>
  );
};

export default AnimatedDots;
