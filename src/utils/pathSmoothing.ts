// Fejlett Catmull-Rom spline interpoláció valódi sima ívekhez
export function smoothPath(points: [number, number][], segments: number = 50): [number, number][] {
  if (points.length < 2) {
    return points;
  }

  if (points.length === 2) {
    return points; // Két pont között egyenes vonal
  }

  const smoothedPoints: [number, number][] = [];
  
  // Minden szegmens között interpolálás
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    
    // Catmull-Rom interpoláció sok ponttal
    for (let t = 0; t <= 1; t += 1 / segments) {
      const lat = catmullRomInterpolate(p0[0], p1[0], p2[0], p3[0], t);
      const lng = catmullRomInterpolate(p0[1], p1[1], p2[1], p3[1], t);
      smoothedPoints.push([lat, lng]);
    }
  }
  
  return smoothedPoints;
}

function catmullRomInterpolate(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  
  return 0.5 * (
    (2 * p1) +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t3
  );
}

// Bezier görbe interpoláció még simább ívekhez
export function createBezierCurve(points: [number, number][], segments: number = 100): [number, number][] {
  if (points.length < 2) {
    return points;
  }
  
  if (points.length === 2) {
    return interpolateBetweenPoints(points[0], points[1], segments);
  }
  
  const curvedPoints: [number, number][] = [];
  curvedPoints.push(points[0]);
  
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    
    // Kontroll pontok számítása a sima ívekhez
    const control1 = getControlPoint(points, i, 0.25);
    const control2 = getControlPoint(points, i + 1, -0.25);
    
    const segment = createBezierSegment(start, control1, control2, end, segments);
    // Az első pontot kihagyjuk, mert már hozzáadtuk
    curvedPoints.push(...segment.slice(1));
  }
  
  return curvedPoints;
}

function getControlPoint(points: [number, number][], index: number, offset: number): [number, number] {
  const current = points[index];
  const prev = points[index - 1];
  const next = points[index + 1];
  
  if (!prev && !next) return current;
  if (!prev) {
    const dx = next[0] - current[0];
    const dy = next[1] - current[1];
    return [current[0] + dx * offset, current[1] + dy * offset];
  }
  if (!next) {
    const dx = current[0] - prev[0];
    const dy = current[1] - prev[1];
    return [current[0] + dx * offset, current[1] + dy * offset];
  }
  
  // Tangent vektor számítása
  const dx = (next[0] - prev[0]) * 0.5;
  const dy = (next[1] - prev[1]) * 0.5;
  
  return [current[0] + dx * offset, current[1] + dy * offset];
}

function createBezierSegment(
  start: [number, number], 
  control1: [number, number], 
  control2: [number, number], 
  end: [number, number],
  segments: number = 50
): [number, number][] {
  const points: [number, number][] = [];
  
  for (let t = 0; t <= 1; t += 1 / segments) {
    const lat = Math.pow(1 - t, 3) * start[0] + 
                3 * Math.pow(1 - t, 2) * t * control1[0] + 
                3 * (1 - t) * Math.pow(t, 2) * control2[0] + 
                Math.pow(t, 3) * end[0];
                
    const lng = Math.pow(1 - t, 3) * start[1] + 
                3 * Math.pow(1 - t, 2) * t * control1[1] + 
                3 * (1 - t) * Math.pow(t, 2) * control2[1] + 
                Math.pow(t, 3) * end[1];
                
    points.push([lat, lng]);
  }
  
  return points;
}

function interpolateBetweenPoints(start: [number, number], end: [number, number], segments: number): [number, number][] {
  const points: [number, number][] = [];
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lat = start[0] + (end[0] - start[0]) * t;
    const lng = start[1] + (end[1] - start[1]) * t;
    points.push([lat, lng]);
  }
  
  return points;
}

// Adaptív simítás - kevesebb pont egyenes szakaszoknál, több pont ívekben
export function adaptiveSmoothing(points: [number, number][]): [number, number][] {
  if (points.length < 3) {
    return points;
  }

  const smoothedPoints: [number, number][] = [];
  smoothedPoints.push(points[0]);

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const current = points[i];
    const next = points[i + 1];

    // Szög számítása a kanyar mértékének meghatározásához
    const angle1 = Math.atan2(current[1] - prev[1], current[0] - prev[0]);
    const angle2 = Math.atan2(next[1] - current[1], next[0] - current[0]);
    const angleDiff = Math.abs(angle2 - angle1);

    // Több pont éles kanyaroknál
    const segmentCount = angleDiff > Math.PI / 4 ? 20 : 10;

    // Bezier interpoláció a jelenlegi szakaszhoz
    const control1: [number, number] = [
      current[0] + (current[0] - prev[0]) * 0.3,
      current[1] + (current[1] - prev[1]) * 0.3
    ];
    const control2: [number, number] = [
      current[0] + (next[0] - current[0]) * 0.3,
      current[1] + (next[1] - current[1]) * 0.3
    ];

    const segment = createBezierSegment(current, control1, control2, next, segmentCount);
    smoothedPoints.push(...segment.slice(0, -1)); // Utolsó pont nélkül
  }

  smoothedPoints.push(points[points.length - 1]);
  return smoothedPoints;
}

// Sima ív létrehozása két irány között
export function createSmoothCurve(
  center: [number, number],
  startAngle: number,
  endAngle: number,
  radius: number,
  segments: number
): [number, number][] {
  const points: [number, number][] = [];
  
  let angleDiff = endAngle - startAngle;
  if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
  if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = startAngle + angleDiff * t;
    const smoothT = t * t * (3 - 2 * t);
    const currentRadius = radius * Math.sin(Math.PI * smoothT);
    
    const x = center[0] + Math.cos(angle) * currentRadius;
    const y = center[1] + Math.sin(angle) * currentRadius;
    
    points.push([x, y]);
  }
  
  return points;
}
