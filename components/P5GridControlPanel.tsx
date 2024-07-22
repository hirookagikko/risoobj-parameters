'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import p5 from 'p5';
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const P5GridControlPanel = () => {
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
  });

  const [currentSettings, setCurrentSettings] = useState(settings);

  const canvasRef = useRef(null);
  const p5InstanceRef = useRef(null);

  const sketch = useCallback((p5: p5) => {
    p5.setup = () => {
      p5.createCanvas(400, 400, currentSettings.is3D ? p5.WEBGL : p5.P2D);
    };

    p5.draw = () => {
      p5.background(240);

      p5.fill(currentSettings.shapeColor);
      p5.stroke(currentSettings.strokeColor);
      p5.strokeWeight(currentSettings.strokeWeight);

      if (currentSettings.is3D) {
        p5.rotateX(p5.radians(currentSettings.rotationX));
        p5.rotateY(p5.radians(currentSettings.rotationY));
        p5.rotateZ(p5.radians(currentSettings.rotationZ));
        
        const spacing = 100;
        const offset = -((Math.min(currentSettings.columns, currentSettings.rows) - 1) * spacing) / 2;

        for (let i = 0; i < currentSettings.columns; i++) {
          for (let j = 0; j < currentSettings.rows; j++) {
            p5.push();
            p5.translate(i * spacing + offset, j * spacing + offset);

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
        const cellWidth = p5.width / currentSettings.columns;
        const cellHeight = p5.height / currentSettings.rows;

        for (let i = 0; i < currentSettings.columns; i++) {
          for (let j = 0; j < currentSettings.rows; j++) {
            const x = i * cellWidth + cellWidth / 2;
            const y = j * cellHeight + cellHeight / 2;

            switch (currentSettings.shapeType) {
              case 'circle':
                p5.ellipse(x, y, currentSettings.shapeSize);
                break;
              case 'square':
                p5.rectMode(p5.CENTER);
                p5.rect(x, y, currentSettings.shapeSize, currentSettings.shapeSize);
                break;
              case 'triangle':
                p5.triangle(
                  x, y - currentSettings.shapeSize / 2,
                  x - currentSettings.shapeSize / 2, y + currentSettings.shapeSize / 2,
                  x + currentSettings.shapeSize / 2, y + currentSettings.shapeSize / 2
                );
                break;
            }
          }
        }
      }
    };
  }, [currentSettings]);

  useEffect(() => {
    const loadP5 = async () => {
      if (typeof window !== 'undefined') {
        if (!window.p5) {
          await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js';
            script.onload = resolve;
            document.body.appendChild(script);
          });
        }
        if (p5InstanceRef.current) {
          p5InstanceRef.current.remove();
        }
        p5InstanceRef.current = new window.p5(sketch, canvasRef.current);
      }
    };

    loadP5().catch(console.error);

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
      }
    };
  }, [sketch]);

  const updateSketch = useCallback(() => {
    setCurrentSettings((prev) => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
      }
      p5InstanceRef.current = new window.p5(sketch, canvasRef.current);
      return { ...settings };
    });
  }, [settings, sketch]);

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <Card className="w-full md:w-1/2">
        <CardHeader>
          <CardTitle>P5.js {currentSettings.is3D ? '3D' : '2D'} Sketch</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={canvasRef}></div>
        </CardContent>
      </Card>
      
      <Card className="w-full md:w-1/2">
        <CardHeader>
          <CardTitle>Control Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="3d-mode"
              checked={settings.is3D}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, is3D: checked }))}
            />
            <Label htmlFor="3d-mode">3D Mode</Label>
          </div>

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
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="shapeSize">Shape Size: {settings.shapeSize}</Label>
            <Slider
              id="shapeSize"
              min={10}
              max={50}
              step={1}
              value={[settings.shapeSize]}
              onValueChange={(value) => setSettings(prev => ({ ...prev, shapeSize: value[0] }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="shapeColor">Shape Color</Label>
            <Input
              id="shapeColor"
              type="color"
              value={settings.shapeColor}
              onChange={(e) => setSettings(prev => ({ ...prev, shapeColor: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="strokeColor">Stroke Color</Label>
            <Input
              id="strokeColor"
              type="color"
              value={settings.strokeColor}
              onChange={(e) => setSettings(prev => ({ ...prev, strokeColor: e.target.value }))}
            />
          </div>

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

          {settings.is3D && (
            <>
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

          <Button onClick={updateSketch} className="w-full">
            Update Sketch
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default P5GridControlPanel;