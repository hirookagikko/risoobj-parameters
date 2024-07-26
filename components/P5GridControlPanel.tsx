'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import p5 from 'p5';

// shadcn/ui コンポーネントのインポート
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

// パターンが利用可能か確認するヘルパー関数
const isPatternAvailable = (p5Instance: any): boolean => {
  return p5Instance && p5Instance.createPattern && p5Instance.PTN;
};

// グローバルな Window オブジェクトに p5 プロパティを追加
declare global {
  interface Window {
    p5: any;
  }
}

const P5GridControlPanel: React.FC = () => {
  // スケッチの設定を管理する state
  const [settings, setSettings] = useState({
    is3D: false,
    columns: 5,
    rows: 5,
    shapeType: 'circle',
    shapeSize: 30,
    shapeColor: '#FF0000',
    strokeColor: '#000000',
    strokeWeight: 1,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    detailX: 24,
    detailY: 16,

    // pattern関連の設定
    usePattern: false,
    patternType: 'stripe', // デフォルトのパターンタイプを 'stripe' に変更
    patternColorPalette: ['#000000', '#0000F0'],
    patternAngle: 0,
    
    // 各パターンタイプに特有のパラメータ
    stripeSize: 20,
    stripeCircleSize: 20,
    polygonSides: 4,
    polygonRadius: 30,
    radialAngle: Math.PI / 15,
    waveAmplitude: 50,
    waveFrequency: 20,
    wavePhase: 40,
    dotSize: 10,
    dotSpacing: 20,
    checkedSize: 20,
    checkedSpacing: 60,
    crossSize: 20,
    crossWeight: 5,
    triangleSize: 40,
    triangleSpacing: 20,
    noiseScale: 0.5,
    zigzagvertices: 20,
    zigzagdepth: 10,

    // 既存のパターン関連の設定（必要に応じて調整）
    patternSize: 10, // 汎用的なサイズパラメータとして保持
    patternWeight: 1,
    patternScale: 1,
  });

  // 現在のスケッチに適用されている設定
  const [currentSettings, setCurrentSettings] = useState(settings);

  // p5.js のキャンバスを表示する div への参照
  const canvasRef = useRef<HTMLDivElement>(null);
  // p5 インスタンスへの参照
  const p5InstanceRef = useRef<p5 | null>(null);

  // p5.js スケッチの定義
  const sketch = useCallback((p5: p5) => {
    let ptnLibrary: any;

    p5.setup = () => {
      // キャンバスの作成（2D または 3D）
      p5.createCanvas(600, 600, currentSettings.is3D ? p5.WEBGL : p5.P2D);

      // p5.pattern ライブラリの確認と初期化
      if ((p5 as any).createPattern) {
        (p5 as any).createPattern();
        ptnLibrary = (p5 as any).PTN;
      }
    };

    p5.draw = () => {
      console.log('p5 draw started');
      p5.background(240);
      p5.noLoop();
      p5.angleMode(p5.DEGREES);

      console.log(currentSettings);

      if (currentSettings.is3D) {
        // 3D モードの描画ロジック
        p5.rotateX(p5.radians(currentSettings.rotationX));
        p5.rotateY(p5.radians(currentSettings.rotationY));
        p5.rotateZ(p5.radians(currentSettings.rotationZ));
        
        const spacing = 100;
        const offset = -((Math.min(currentSettings.columns, currentSettings.rows) - 1) * spacing) / 2;
    
        for (let i = 0; i < currentSettings.columns; i++) {
          for (let j = 0; j < currentSettings.rows; j++) {
            p5.push();
            p5.translate(i * spacing + offset, j * spacing + offset);
            p5.stroke(currentSettings.strokeColor);
            p5.strokeWeight(currentSettings.strokeWeight);
            p5.fill(currentSettings.shapeColor);

            // 3D 図形の描画
            switch (currentSettings.shapeType) {
              case 'box':
                p5.box(currentSettings.shapeSize, currentSettings.detailX, currentSettings.detailY);
                break;
              case 'sphere':
                p5.sphere(currentSettings.shapeSize / 2, currentSettings.detailX, currentSettings.detailY);
                break;
              case 'torus':
                p5.torus(currentSettings.shapeSize / 2, currentSettings.shapeSize / 4, currentSettings.detailX, currentSettings.detailY);
                break;
            }
            p5.pop();
          }
        }
      } else {
        // 2D モードの描画ロジック
        const cellWidth = p5.width / currentSettings.columns;
        const cellHeight = p5.height / currentSettings.rows;
    
        for (let i = 0; i < currentSettings.columns; i++) {
          for (let j = 0; j < currentSettings.rows; j++) {
            const x = i * cellWidth + cellWidth / 2;
            const y = j * cellHeight + cellHeight / 2;
    
            p5.push();
            p5.translate(x - currentSettings.shapeSize / 2, y - currentSettings.shapeSize / 2);
    
            p5.stroke(currentSettings.strokeColor);
            p5.strokeWeight(currentSettings.strokeWeight);
            
            if (currentSettings.usePattern) {
              (p5 as any).patternAngle(currentSettings.patternAngle);
              (p5 as any).patternColors(currentSettings.patternColorPalette.map(c => p5.color(c)));
              switch (currentSettings.patternType) {
                case 'stripe':
                  (p5 as any).pattern(PTN.stripe(currentSettings.stripeSize));
                  break;
                case 'stripeCircle':
                  (p5 as any).pattern(PTN.stripeCircle(currentSettings.stripeCircleSize));
                  break;
                case 'stripePolygon':
                  (p5 as any).pattern(PTN.stripePolygon(currentSettings.polygonSides, currentSettings.stripeSize, currentSettings.polygonRadius));
                  break;
                case 'stripeRadial':
                  (p5 as any).pattern(PTN.stripeRadial(currentSettings.radialAngle));
                  break;
                case 'wave':
                  (p5 as any).pattern(PTN.wave(currentSettings.waveAmplitude, currentSettings.waveFrequency, currentSettings.wavePhase, currentSettings.stripeSize));
                  break;
                case 'dot':
                  (p5 as any).pattern(PTN.dot(currentSettings.dotSize, currentSettings.dotSpacing));
                  break;
                case 'checked':
                  (p5 as any).pattern(PTN.checked(currentSettings.checkedSize, currentSettings.checkedSpacing));
                  break;
                case 'cross':
                  (p5 as any).pattern(PTN.cross(currentSettings.crossSize, currentSettings.crossWeight));
                  break;
                case 'triangle':
                  (p5 as any).pattern(PTN.triangle(currentSettings.triangleSize, currentSettings.triangleSpacing));
                  break;
                case 'noise':
                  (p5 as any).pattern(PTN.noise(currentSettings.noiseScale));
                  break;
                case 'noiseGrad':
                  (p5 as any).pattern(PTN.noiseGrad(currentSettings.noiseScale));
                  break;
                default:
                  console.warn('Unknown pattern type:', currentSettings.patternType);
                  return null;
              }
            } else {
              p5.fill(currentSettings.shapeColor);
            }

            switch (currentSettings.shapeType) {
              case 'circle':
                if (currentSettings.usePattern) {
                  (p5 as any).ellipsePattern(currentSettings.shapeSize / 2, currentSettings.shapeSize / 2, currentSettings.shapeSize, currentSettings.shapeSize);
                } else {
                  p5.ellipse(currentSettings.shapeSize / 2, currentSettings.shapeSize / 2, currentSettings.shapeSize);
                }
                break;
              case 'square':
                if (currentSettings.usePattern) {
                  (p5 as any).rectPattern(0, 0, currentSettings.shapeSize, currentSettings.shapeSize);
                } else {
                  p5.rect(0, 0, currentSettings.shapeSize, currentSettings.shapeSize);
                }
                break;
              case 'triangle':
                if (currentSettings.usePattern) {
                  (p5 as any).beginShapePattern();
                  (p5 as any).vertexPattern(currentSettings.shapeSize / 2, 0);
                  (p5 as any).vertexPattern(0, currentSettings.shapeSize);
                  (p5 as any).vertexPattern(currentSettings.shapeSize, currentSettings.shapeSize);
                  (p5 as any).endShapePattern(p5.CLOSE);
                } else {
                  p5.triangle(
                    currentSettings.shapeSize / 2, 0,
                    0, currentSettings.shapeSize,
                    currentSettings.shapeSize, currentSettings.shapeSize
                  );
                }
                break;
              case 'zigzag':
                if (currentSettings.usePattern) {
                  (p5 as any).beginShapePattern();
                } else {
                  p5.beginShape();
                }
                for (let i = 0;i<=currentSettings.zigzagvertices;i++) {
                  let angle = p5.map(i, 0, currentSettings.zigzagvertices, 0, 360);
                  let r = (i%2 == 0)?1:(1 - currentSettings.zigzagdepth / 100);
                  let px = currentSettings.shapeSize / 2 + r / 2 * (currentSettings.shapeSize) * p5.cos(angle);
                  let py = currentSettings.shapeSize / 2 + r / 2 * (currentSettings.shapeSize) * p5.sin(angle);
                  if (currentSettings.usePattern) {
                    (p5 as any).vertexPattern(px, py);
                  } else {
                    p5.vertex(px, py);
                  }
                }
                if (currentSettings.usePattern) {
                  (p5 as any).endShapePattern(p5.CLOSE);
                } else {
                  p5.endShape(p5.CLOSE);
                }
                break;
            }
    
            p5.pop();
          }
        }
      }
    };
  }, [currentSettings]);

  // p5.js インスタンスの初期化
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).p5) {
      // 既存の p5 インスタンスを削除
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
      }
      
      // 新しい p5 インスタンスを作成
      p5InstanceRef.current = new (window as any).p5(sketch, canvasRef.current);

      // 追加のライブラリの初期化（例）
      if ((window as any).P5Library) {
        (window as any).P5Library.init(p5InstanceRef.current);
      }

      // p5.pattern の利用可能性をチェック
      if (isPatternAvailable(p5InstanceRef.current)) {
        setSettings(prev => ({
          ...prev,
          patternAvailable: true
        }));
      }
    }

    // クリーンアップ関数
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
      }
    };

  }, [sketch]);

  // スケッチの更新関数
  const updateSketch = useCallback(() => {
    setCurrentSettings((prev) => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
      }
      p5InstanceRef.current = new (window as any).p5(sketch, canvasRef.current);
      return { ...settings };
    });
  }, [settings, sketch]);

  // UI レンダリング
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* スケッチ表示エリア */}
      <Card className="w-full md:w-1/2">
        <CardHeader>
          <CardTitle>P5.js {currentSettings.is3D ? '3D' : '2D'} Sketch</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={canvasRef}></div>
        </CardContent>
      </Card>
      
      {/* コントロールパネル */}
      <Card className="w-full md:w-1/2">
        <CardHeader>
          <CardTitle>Control Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 3D モード切り替え */}
          <div className="flex items-center space-x-2">
            <Switch
              id="3d-mode"
              checked={settings.is3D}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, is3D: checked }))}
            />
            <Label htmlFor="3d-mode">3D Mode</Label>
          </div>

          {/* 列数設定 */}
          <div className="space-y-2">
            <Label htmlFor="columns">Columns: {settings.columns}</Label>
            <Slider
              id="columns"
              min={1}
              max={10}
              step={1}
              value={[settings.columns]}
              onValueChange={(value) => setSettings(prev => ({ ...prev, columns: value[0] }))}
            />
          </div>
          
          {/* 行数設定 */}
          <div className="space-y-2">
            <Label htmlFor="rows">Rows: {settings.rows}</Label>
            <Slider
              id="rows"
              min={1}
              max={10}
              step={1}
              value={[settings.rows]}
              onValueChange={(value) => setSettings(prev => ({ ...prev, rows: value[0] }))}
            />
          </div>
          
          {/* 図形タイプ選択 */}
          <div className="space-y-2">
            <Label htmlFor="shapeType">Shape Type</Label>
            <Select value={settings.shapeType} onValueChange={(value) => setSettings(prev => ({ ...prev, shapeType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select shape type" />
              </SelectTrigger>
              <SelectContent>
                {settings.is3D ? (
                  <>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="sphere">Sphere</SelectItem>
                    <SelectItem value="torus">Torus</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="circle">Circle</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="triangle">Triangle</SelectItem>
                    <SelectItem value="zigzag">Zigzag</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          
          {/* 図形サイズ設定 */}
          <div className="space-y-2">
            <Label htmlFor="shapeSize">Shape Size: {settings.shapeSize}</Label>
            <Slider
              id="shapeSize"
              min={10}
              max={200}
              step={1}
              value={[settings.shapeSize]}
              onValueChange={(value) => setSettings(prev => ({ ...prev, shapeSize: value[0] }))}
            />
          </div>

          {/* Zigzag 固有の設定 */}
          {!settings.is3D && settings.shapeType === 'zigzag' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="zigzagdepth">Zigzag Depth: {settings.zigzagdepth}</Label>
                <Slider
                  id="zigzagdepth"
                  min={1}
                  max={50}
                  step={1}
                  value={[settings.zigzagdepth]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, zigzagdepth: value[0] }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zigzagvertices">Zigzag Vertices: {settings.zigzagvertices}</Label>
                <Slider
                  id="zigzagvertices"
                  min={3}
                  max={50}
                  step={1}
                  value={[settings.zigzagvertices]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, zigzagvertices: value[0] }))}
                />
              </div>
            </>
          )}
          
          {/* 図形色設定 */}
          <div className="space-y-2">
            <Label htmlFor="shapeColor">Shape Color</Label>
            <Input
              id="shapeColor"
              type="color"
              value={settings.shapeColor}
              onChange={(e) => setSettings(prev => ({ ...prev, shapeColor: e.target.value }))}
            />
          </div>

          {/* 線の色設定 */}
          <div className="space-y-2">
            <Label htmlFor="strokeColor">Stroke Color</Label>
            <Input
              id="strokeColor"
              type="color"
              value={settings.strokeColor}
              onChange={(e) => setSettings(prev => ({ ...prev, strokeColor: e.target.value }))}
            />
          </div>

          {/* 線の太さ設定 */}
          <div className="space-y-2">
            <Label htmlFor="strokeWeight">Stroke Weight: {settings.strokeWeight}</Label>
            <Slider
              id="strokeWeight"
              min={0}
              max={10}
              step={1}
              value={[settings.strokeWeight]}
              onValueChange={(value) => setSettings(prev => ({ ...prev, strokeWeight: value[0] }))}
            />
          </div>

          {/* 3D モード時の追加設定 */}
          {settings.is3D && (
            <>
              {/* X軸回転設定 */}
              <div className="space-y-2">
                <Label htmlFor="rotationX">Rotation X: {settings.rotationX}°</Label>
                <Slider
                  id="rotationX"
                  min={0}
                  max={360}
                  step={1}
                  value={[settings.rotationX]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, rotationX: value[0] }))}
                />
              </div>
              {/* Y軸回転設定 */}
              <div className="space-y-2">
                <Label htmlFor="rotationY">Rotation Y: {settings.rotationY}°</Label>
                <Slider
                  id="rotationY"
                  min={0}
                  max={360}
                  step={1}
                  value={[settings.rotationY]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, rotationY: value[0] }))}
                />
              </div>
              {/* Z軸回転設定 */}
              <div className="space-y-2">
                <Label htmlFor="rotationZ">Rotation Z: {settings.rotationZ}°</Label>
                <Slider
                  id="rotationZ"
                  min={0}
                  max={360}
                  step={1}
                  value={[settings.rotationZ]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, rotationZ: value[0] }))}
                />
              </div>
              {/* X方向の詳細度設定 */}
              <div className="space-y-2">
                <Label htmlFor="detailX">Detail X: {settings.detailX}</Label>
                <Slider
                  id="detailX"
                  min={3}
                  max={24}
                  step={1}
                  value={[settings.detailX]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, detailX: value[0] }))}
                />
              </div>
              {/* Y方向の詳細度設定 */}
              <div className="space-y-2">
                <Label htmlFor="detailY">Detail Y: {settings.detailY}</Label>
                <Slider
                  id="detailY"
                  min={3}
                  max={24}
                  step={1}
                  value={[settings.detailY]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, detailY: value[0] }))}
                />
              </div>
            </>
          )}

          {/* パターン使用の切り替え */}
          <div className="flex items-center space-x-2">
            <Switch
              id="use-pattern"
              checked={settings.usePattern}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, usePattern: checked }))}
            />
            <Label htmlFor="use-pattern">Use Pattern</Label>
          </div>

          {settings.usePattern && (
            <>
              {/* パターンタイプの選択 */}
              <div className="space-y-2">
                <Label htmlFor="patternType">Pattern Type</Label>
                <Select value={settings.patternType} onValueChange={(value) => setSettings(prev => ({ ...prev, patternType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pattern type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="stripeCircle">Stripe Circle</SelectItem>
                    <SelectItem value="stripePolygon">Stripe Polygon</SelectItem>
                    <SelectItem value="stripeRadial">Stripe Radial</SelectItem>
                    <SelectItem value="wave">Wave</SelectItem>
                    <SelectItem value="dot">Dot</SelectItem>
                    <SelectItem value="checked">Checked</SelectItem>
                    <SelectItem value="cross">Cross</SelectItem>
                    <SelectItem value="triangle">Triangle</SelectItem>
                    <SelectItem value="noise">Noise</SelectItem>
                    <SelectItem value="noiseGrad">Noise Gradient</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* パターンカラーパレットの設定 */}
              <div className="space-y-2">
                <Label>Pattern Color Palette</Label>
                <div className="flex space-x-2">
                  <Input
                    type="color"
                    value={settings.patternColorPalette[0]}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      patternColorPalette: [e.target.value, prev.patternColorPalette[1]]
                    }))}
                  />
                  <Input
                    type="color"
                    value={settings.patternColorPalette[1]}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      patternColorPalette: [prev.patternColorPalette[0], e.target.value]
                    }))}
                  />
                </div>
              </div>

              {/* パターン角度 */}
              <div className="space-y-2">
                <Label htmlFor="patternAngle">Pattern Angle: {settings.patternAngle}</Label>
                <Slider
                  id="patternAngle"
                  min={0}
                  max={360}
                  step={1}
                  value={[settings.patternAngle]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, patternAngle: value[0] }))}
                />
              </div>

              {/* パターン固有のパラメータ設定 */}
              {settings.patternType === 'stripe' && (
                <div className="space-y-2">
                  <Label htmlFor="stripeSize">Stripe Size: {settings.stripeSize}</Label>
                  <Slider
                    id="stripeSize"
                    min={1}
                    max={100}
                    step={1}
                    value={[settings.stripeSize]}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, stripeSize: value[0] }))}
                  />
                </div>
              )}

              {settings.patternType === 'stripeCircle' && (
                <div className="space-y-2">
                  <Label htmlFor="stripeCircleSize">Stripe Circle Size: {settings.stripeCircleSize}</Label>
                  <Slider
                    id="stripeCircleSize"
                    min={1}
                    max={100}
                    step={1}
                    value={[settings.stripeCircleSize]}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, stripeCircleSize: value[0] }))}
                  />
                </div>
              )}

              {settings.patternType === 'stripePolygon' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="polygonSides">Polygon Sides: {settings.polygonSides}</Label>
                    <Slider
                      id="polygonSides"
                      min={3}
                      max={10}
                      step={1}
                      value={[settings.polygonSides]}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, polygonSides: value[0] }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripeSize">Stripe Size: {settings.stripeSize}</Label>
                    <Slider
                      id="stripeSize"
                      min={1}
                      max={100}
                      step={1}
                      value={[settings.stripeSize]}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, stripeSize: value[0] }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="polygonRadius">Polygon Radius: {settings.polygonRadius}</Label>
                    <Slider
                      id="polygonRadius"
                      min={10}
                      max={100}
                      step={1}
                      value={[settings.polygonRadius]}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, polygonRadius: value[0] }))}
                    />
                  </div>
                </>
              )}

              {settings.patternType === 'stripeRadial' && (
                <div className="space-y-2">
                  <Label htmlFor="radialAngle">Radial Angle: {(settings.radialAngle * 180 / Math.PI).toFixed(2)}°</Label>
                  <Slider
                    id="radialAngle"
                    min={0}
                    max={Math.PI}
                    step={Math.PI / 180}
                    value={[settings.radialAngle]}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, radialAngle: value[0] }))}
                  />
                </div>
              )}

              {settings.patternType === 'wave' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="waveAmplitude">Wave Amplitude: {settings.waveAmplitude}</Label>
                    <Slider
                      id="waveAmplitude"
                      min={1}
                      max={100}
                      step={1}
                      value={[settings.waveAmplitude]}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, waveAmplitude: value[0] }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waveFrequency">Wave Frequency: {settings.waveFrequency}</Label>
                    <Slider
                      id="waveFrequency"
                      min={1}
                      max={50}
                      step={1}
                      value={[settings.waveFrequency]}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, waveFrequency: value[0] }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wavePhase">Wave Phase: {settings.wavePhase}</Label>
                    <Slider
                      id="wavePhase"
                      min={0}
                      max={100}
                      step={1}
                      value={[settings.wavePhase]}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, wavePhase: value[0] }))}
                    />
                  </div>
                </>
              )}

              {settings.patternType === 'dot' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="dotSize">Dot Size: {settings.dotSize}</Label>
                    <Slider
                      id="dotSize"
                      min={1}
                      max={50}
                      step={1}
                      value={[settings.dotSize]}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, dotSize: value[0] }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dotSpacing">Dot Spacing: {settings.dotSpacing}</Label>
                    <Slider
                      id="dotSpacing"
                      min={1}
                      max={100}
                      step={1}
                      value={[settings.dotSpacing]}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, dotSpacing: value[0] }))}
                    />
                  </div>
                </>
              )}

              {settings.patternType === 'checked' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="checkedSize">Checked Size: {settings.checkedSize}</Label>
                    <Slider
                      id="checkedSize"
                      min={1}
                      max={50}
                      step={1}
                      value={[settings.checkedSize]}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, checkedSize: value[0] }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkedSpacing">Checked Spacing: {settings.checkedSpacing}</Label>
                    <Slider
                      id="checkedSpacing"
                      min={1}
                      max={100}
                      step={1}
                      value={[settings.checkedSpacing]}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, checkedSpacing: value[0] }))}
                    />
                  </div>
                </>
              )}

              {settings.patternType === 'cross' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="crossSize">Cross Size: {settings.crossSize}</Label>
                    <Slider
                      id="crossSize"
                      min={1}
                      max={50}
                      step={1}
                      value={[settings.crossSize]}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, crossSize: value[0] }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="crossWeight">Cross Weight: {settings.crossWeight}</Label>
                    <Slider
                      id="crossWeight"
                      min={1}
                      max={20}
                      step={1}
                      value={[settings.crossWeight]}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, crossWeight: value[0] }))}
                    />
                  </div>
                </>
              )}

              {settings.patternType === 'triangle' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="triangleSize">Triangle Size: {settings.triangleSize}</Label>
                    <Slider
                      id="triangleSize"
                      min={1}
                      max={100}
                      step={1}
                      value={[settings.triangleSize]}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, triangleSize: value[0] }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="triangleSpacing">Triangle Spacing: {settings.triangleSpacing}</Label>
                    <Slider
                      id="triangleSpacing"
                      min={1}
                      max={100}
                      step={1}
                      value={[settings.triangleSpacing]}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, triangleSpacing: value[0] }))}
                    />
                  </div>
                </>
              )}

              {(settings.patternType === 'noise' || settings.patternType === 'noiseGrad') && (
                <div className="space-y-2">
                  <Label htmlFor="noiseScale">Noise Scale: {settings.noiseScale.toFixed(2)}</Label>
                  <Slider
                    id="noiseScale"
                    min={0.1}
                    max={2}
                    step={0.1}
                    value={[settings.noiseScale]}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, noiseScale: value[0] }))}
                  />
                </div>
              )}

              {/* 共通のパターンスケール設定 */}
              <div className="space-y-2">
                <Label htmlFor="patternScale">Pattern Scale: {settings.patternScale.toFixed(2)}</Label>
                <Slider
                  id="patternScale"
                  min={0.1}
                  max={2}
                  step={0.1}
                  value={[settings.patternScale]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, patternScale: value[0] }))}
                />
              </div>
            </>
          )}

          {/* スケッチ更新ボタン */}
          <Button onClick={updateSketch} className="w-full">
            Update Sketch
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default P5GridControlPanel;