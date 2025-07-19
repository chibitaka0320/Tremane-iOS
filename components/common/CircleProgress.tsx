import theme from "@/styles/theme";
import React from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type CircleProgressProps = {
  size?: number;
  strokeWidth?: number;
  percentages: number[];
};

export default function CircleProgress({
  size = 200,
  strokeWidth = 6,
  percentages,
}: CircleProgressProps) {
  const center = size / 2;

  // 各円の半径（内→外へ）
  const baseRadii = [30, 50, 70];

  return (
    <View>
      <Svg width={size} height={size}>
        {percentages.map((percent, index) => {
          const radius = baseRadii[index];
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference * (1 - percent);

          return (
            <React.Fragment key={index}>
              {/* 薄い青の背景円 */}
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={theme.colors.primary}
                strokeWidth={strokeWidth}
                opacity={0.2}
                fill="none"
              />
              {/* 濃い青の進捗円弧 */}
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={theme.colors.primary}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${circumference}`}
                strokeDashoffset={strokeDashoffset}
                rotation={-90}
                origin={`${center}, ${center}`}
                fill="none"
              />
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
