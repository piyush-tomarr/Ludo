// import { Circle } from "react-konva";
// import { useEffect, useRef } from "react";
// import Konva from "konva";

// const Token = ({ x, y, color }) => {
//   const tokenRef = useRef(null);

//   useEffect(() => {
//     if (!tokenRef.current) return;

//     tokenRef.current.to({
//       x,
//       y,
//       duration: 0.3,
//       easing: Konva.Easings.EaseInOut
//     });
//   }, [x, y]);

//   return (
//     <Circle
//       ref={tokenRef}
//       x={x}
//       y={y}
//       radius={12}
//       fill={color}
//       shadowBlur={4}
//     />
//   );
// };

// export default Token;






import { Circle } from "react-konva";

const Token = ({ x, y, color, onClick }) => {
  return (
    <Circle
      x={x}
      y={y}
      radius={12}
      fill={color}
      shadowBlur={5}
      onClick={onClick}
    />
  );
};

export default Token;
