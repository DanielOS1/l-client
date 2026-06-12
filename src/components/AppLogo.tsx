import React from "react";
import { View, Text } from "react-native";
import Svg, { Path, G, Defs, LinearGradient, Stop } from "react-native-svg";

interface AppLogoProps {
  iconSize?: number;
  showText?: boolean;
  layout?: "row" | "column";
  /** "dark" = white bg (teal+navy text), "light" = teal bg (white icon + white/gold text) */
  textVariant?: "dark" | "light";
}

function LogoIcon({ size, tealColor = "#3AC4BE" }: { size: number; tealColor?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1080 1080">
      <Defs>
        {/* Gold gradient — arc/swoosh */}
        <LinearGradient
          id="logo_g1"
          gradientUnits="userSpaceOnUse"
          x1="254.9365"
          y1="534.1692"
          x2="681.0801"
          y2="534.1692"
        >
          <Stop offset="0" stopColor="#B46A11" />
          <Stop offset="0.32" stopColor="#D68D15" />
          <Stop offset="0.68" stopColor="#E7AC18" />
          <Stop offset="1" stopColor="#F8C73D" />
        </LinearGradient>
        {/* Gold gradient — crown decoration */}
        <LinearGradient
          id="logo_g4"
          gradientUnits="userSpaceOnUse"
          x1="116.4391"
          y1="300.9608"
          x2="662.6926"
          y2="300.9608"
        >
          <Stop offset="0" stopColor="#B46A11" />
          <Stop offset="0.32" stopColor="#D68D15" />
          <Stop offset="0.68" stopColor="#E7AC18" />
          <Stop offset="1" stopColor="#F8C73D" />
        </LinearGradient>
      </Defs>

      <G>
        {/* Gold arc that connects crown to body */}
        <Path
          fill="url(#logo_g1)"
          d="M272,544.2c0,0-22.9,47.9-15.6,150.9c0,0,25-210.3,424.7-272.7l-11.5-49.3C669.5,373.2,409.5,403,272,544.2z"
        />

        {/* Teal outer right column */}
        <Path
          fill={tealColor}
          d="M712.7,669.9l-2.8-198.4c-0.5-34.8-5.3-67.4-14.2-101c0,0,69.8-7,110.2,0
            c0,0,24.3,155.7,25.6,289.7l0,0l-1.5,61.7l-0.1,0.9c0.1-0.1,0.1-0.2,0.2-0.3
            c-2.1,35.3-6.8,66.1-15.1,88c-55.9,146.4-164.5,181.7-265.5,179.4l0.4,0.1
            c-0.4,0-42.6-1.4-91.5-12.8C414,966.9,354.3,945.2,322,901
            c9.5,4.3,49.2,21.6,86.4,26.6c65.1,8.7,116.3,4.2,156.6-8.4
            c0,0,0.1,0,0.3-0.1c53.9-16.6,98.9-54.5,123.3-105.3
            C705.5,778.5,711.5,734.8,712.7,669.9z"
        />

        {/* Crown — gold gradient with multiple decorative bumps */}
        <Path
          fill="url(#logo_g4)"
          d="M642.8,186c0-1.7,0.8-3.4,2.1-4.5c7.3-6.7,12.3-18,13-31
            c1.1-21.5-10.2-39.5-25.3-40.2c-15.1-0.8-28.1,16-29.2,37.5
            c-0.6,11.7,2.5,22.5,7.9,29.9c0.7,0.9,0.8,2.1,0.4,3.2
            c-6.3,15.5-22.3,51.6-40.3,63.6c-18.2,12.2-33.6-13.2-39.2-24.3
            c-0.7-1.4-0.4-3,0.8-4.1c6.1-5.7,9.7-14.6,9.1-24.5
            c-1.1-16-13-28.3-26.6-27.4c-13.7,0.9-23.9,14.6-22.8,30.6
            c0.7,10.4,6,19.3,13.4,23.9c1.2,0.8,1.8,2.3,1.4,3.7
            c-2.3,9.1-9.3,30.5-23.7,38.9c-16.1,9.4-94.2-70.1-113.9-90.6
            c-1-1.1-1.2-2.6-0.6-3.9c5.9-12,5.4-29.4-2.7-45.9
            C354.8,97,331.8,84.3,315,92.5s-20.8,34.2-9.1,58.1
            c7.3,14.9,19.1,25.5,31,29.3c1.4,0.4,2.4,1.7,2.4,3.2
            c0.7,28.4,2.3,142.5-12.5,150.6c-13.6,7.4-35.2-6.1-43.1-11.6
            c-1.2-0.8-1.7-2.4-1.3-3.8c2.1-7.6,0.8-16.5-4.1-24.4
            c-8.5-13.6-24.8-18.8-36.4-11.5c-11.6,7.3-14.1,24.2-5.6,37.8
            c4.7,7.5,11.8,12.5,19.2,14.1c0.8,0.2,1.5,0.6,2,1.3
            c4.8,6.3,18.4,27,1.6,41.2c-14.2,12-51.7,0.7-72.3-6.8
            c-1.3-0.5-2.1-1.6-2.2-2.9c-0.9-9.6-6.3-20.3-15.6-28.8
            c-15.9-14.5-37-17.2-47.1-6.1c-10.2,11.1-5.5,31.9,10.3,46.4
            c8.1,7.4,17.5,11.7,26.1,12.7c1.3,0.1,2.4,0.8,3.4,1.6
            c52.9,38.9,95.9,113.4,100.2,119c0.1,0.2,0.3,0.2,0.5,0.1
            c172.8-142.2,389.7-166.5,400-167.6c0.2,0,0.3-0.2,0.3-0.4
            C661.4,336.8,642,232.3,642.8,186z"
        />

        {/* Teal inner arch — left side of the letter */}
        <Path
          fill={tealColor}
          d="M680,706.6V450.5c-13.5,0.6-28.5,2.7-43.1,5.4
            c-33.7,6.2-69,16.3-75.4,18.2v235.2v2.1
            c0,38.1-25.1,70.3-59.6,81.1c-65.9,87.4-120.6,92.6-122.7,92.8
            c8.6,3.3,17.6,5.8,26.7,7.2C691.8,938.6,680,706.6,680,706.6z"
        />

        {/* Gold bottom foot of the letter */}
        <Path
          fill="#FFC200"
          d="M476.6,796.2L476.6,796.2c-46.9,0-84.9-38-84.9-84.9v-2.1v-33.4
            c-0.5-7.4-0.1-15.5,0-23.3v-8.4c-0.4-16.2-0.3-31.3,0-44.5v-47.5v-1.4
            c-80.9,58.7-132,177.5-132,177.5s-7.7,105.9,119.5,157
            c0,0,55.5-3.7,122.7-92.8C493.9,794.9,485.4,796.2,476.6,796.2z"
        />
      </G>
    </Svg>
  );
}

export function AppLogo({
  iconSize = 48,
  showText = true,
  layout = "row",
  textVariant = "dark",
}: AppLogoProps) {
  const isRow = layout === "row";
  const lolosColor = textVariant === "light" ? "#ffffff" : "#1e293b";
  const appColor = textVariant === "light" ? "#FFC200" : "#3AC4BE";
  const iconTealColor = textVariant === "light" ? "#ffffff" : "#3AC4BE";

  return (
    <View
      style={{
        flexDirection: isRow ? "row" : "column",
        alignItems: "center",
        gap: isRow ? Math.round(iconSize * 0.2) : Math.round(iconSize * 0.15),
      }}
    >
      <LogoIcon size={iconSize} tealColor={iconTealColor} />

      {showText && (
        <Text
          style={{
            fontSize: Math.round(iconSize * 0.38),
            fontWeight: "900",
            letterSpacing: -0.5,
          }}
        >
          <Text style={{ color: lolosColor }}>Lolos</Text>
          <Text style={{ color: appColor }}>App</Text>
        </Text>
      )}
    </View>
  );
}
