import React, { useState, useEffect, useRef } from 'react';
import { Radio, Mic, Square, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RiskMeter } from '@/components/ui/RiskMeter';
import { Waveform } from '@/components/ui/Waveform';
import { Navbar } from '@/components/layout/Navbar';

/**
 * LIVE STREAM VOICE ANALYSIS
 * Real-time microphone audio streaming with backend analysis
 */
export default function LiveStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [riskScore, setRiskScore] = useState(0);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  // Start live stream
  const startLiveStream = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      console.log('Starting live stream...');

      // Get microphone
      console.log('Requesting microphone...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false 
        } 
      });

      streamRef.current = stream;
      console.log('Microphone granted');

      // Setup audio context
      console.log('Setting up audio context...');
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyser);

      // Setup WebSocket - Connect to backend on port 8080
      console.log('Connecting to WebSocket...');
      const wsUrl = `ws://localhost:8080`;
      console.log('WS URL:', wsUrl);

      wsRef.current = new WebSocket(wsUrl);

      // Set connection timeout
      const connectionTimeout = setTimeout(() => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) {
          setError('WebSocket connection timeout (>5s)');
          setIsConnecting(false);
          if (wsRef.current) wsRef.current.close();
        }
      }, 5000);

      wsRef.current.onopen = () => {
        console.log('✓ WebSocket connected');
        clearTimeout(connectionTimeout);
        setIsStreaming(true);
        setIsConnecting(false);

        // Extract session ID
        const tempId = Math.random().toString(36).substr(2, 9);
        setSessionId(tempId);
        console.log('Session ID:', tempId);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('[WS] Message received:', message.type, message);

          if (message.type === 'analysis_result') {
            console.log('[WS] Processing analysis result...');
            handleAnalysisResult(message);
          } else if (message.type === 'stream_complete') {
            console.log('[WS] Stream complete - Session Summary:', message.summary);
            setIsStreaming(false);
          } else if (message.type === 'connected') {
            console.log('[WS] Connected to backend:', message.sessionId);
          } else if (message.type === 'error') {
            console.error('[WS] Error from backend:', message.message);
            setError(message.message);
          }
        } catch (err) {
          console.error('[WS] Message parsing error:', err);
        }
      };

      wsRef.current.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('WebSocket connection failed');
        setIsConnecting(false);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket closed');
        setIsStreaming(false);
      };

      // Start visualization
      visualizeAudio(analyser);

      // Record and send chunks
      console.log('Setting up MediaRecorder...');
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (wsRef.current?.readyState === WebSocket.OPEN && event.data.size > 0) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const base64 = btoa(reader.result as string);
              wsRef.current!.send(JSON.stringify({
                type: 'audio_chunk',
                data: base64,
                timestamp: Date.now()
              }));
            } catch (err) {
              console.error('Send error:', err);
            }
          };
          reader.readAsBinaryString(event.data);
        }
      };

      mediaRecorderRef.current.onerror = (err) => {
        console.error('MediaRecorder error:', err);
        setError('Recording error: ' + err.error);
      };

      // Send 500ms chunks
      console.log('Starting recording...');
      mediaRecorderRef.current.start(500);
      console.log('✓ Live stream started');

    } catch (err: any) {
      console.error('Start stream error:', err);
      setError(err.message || 'Failed to start streaming');
      setIsConnecting(false);
    }
  };

  // Handle analysis results from backend
  const handleAnalysisResult = (message: any) => {
    try {
      console.log('[ANALYSIS] Processing:', JSON.stringify(message).substring(0, 200));
      
      // Extract risk score from the comprehensive response
      const riskScore = message.riskScores?.simple_score ?? 0;
      const fullScore = message.riskScores?.full_analysis_score ?? riskScore;
      const confidence = message.riskScores?.confidence ?? 0;
      const verdict = message.riskScores?.verdict ?? 'UNKNOWN';

      console.log(`[ANALYSIS] Risk: ${riskScore}, Full: ${fullScore}, Confidence: ${confidence}%`);

      setRiskScore(riskScore);
      setAnalysisCount(prev => prev + 1);

      // Extract components
      const components = message.component_analysis || {};
      const cognitive = components.cognitive_intelligence?.score || 0;
      const behavioral = components.behavioral_biometrics?.score || 0;
      const environmental = components.environmental_forensics?.score || 0;
      const liveness = components.liveness_detection?.score || 0;

      // Extract artifacts
      const artifacts = message.artifacts || {};
      const quality = message.quality || {};
      const features = message.voice_features || {};

      // Store comprehensive analysis
      setCurrentAnalysis({
        riskScore: riskScore,
        fullScore: fullScore,
        confidence: confidence,
        verdict: verdict,
        analysisNumber: message.analysisNumber,
        timestamp: message.timestamp,
        components: {
          cognitive,
          behavioral,
          environmental,
          liveness
        },
        artifacts,
        quality,
        features,
        recommendation: message.recommendation,
        monitoring: message.monitoring,
        security: message.security
      });

      // Add to history
      setAnalysisHistory(prev => [
        {
          timestamp: new Date(),
          riskScore: riskScore,
          verdict: verdict,
          recommendation: message.recommendation,
          quality: quality
        },
        ...prev
      ].slice(0, 50)); // Keep last 50

      console.log(`[ANALYSIS] ✓ Complete - Risk:${riskScore}, Cognitive:${cognitive}, Behavioral:${behavioral}, Environmental:${environmental}, Liveness:${liveness}`);
    } catch (err) {
      console.error('[ANALYSIS ERROR]', err);
    }
  };

  // Visualize audio waveform
  const visualizeAudio = (analyser: AnalyserNode) => {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      // Downsample to 100 points
      const downsample = Math.floor(bufferLength / 100);
      const visualData: number[] = [];

      for (let i = 0; i < 100; i++) {
        const index = i * downsample;
        visualData.push(dataArray[index] / 256);
      }

      setWaveformData(visualData);
    };

    draw();
  };

  // Stop live stream
  const stopLiveStream = () => {
    // Stop recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'end_stream' }));
      wsRef.current.close();
      wsRef.current = null;
    }

    // Stop audio
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    // Stop animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setIsStreaming(false);
  };

  // Get recommendation color
  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'ALLOW':
        return 'bg-green-500/20 border-green-500 text-green-300';
      case 'CHALLENGE_REQUIRED':
        return 'bg-yellow-500/20 border-yellow-500 text-yellow-300';
      case 'BLOCK_IMMEDIATE':
        return 'bg-red-500/20 border-red-500 text-red-300';
      default:
        return 'bg-gray-500/20 border-gray-500 text-gray-300';
    }
  };

  // Get risk level text
  const getRiskLevel = (score: number) => {
    if (score > 75) return 'CRITICAL';
    if (score > 50) return 'HIGH';
    if (score > 30) return 'MEDIUM';
    return 'LOW';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Debug Banner - ALWAYS VISIBLE */}
      <div className="bg-cyan-600 text-white p-2 text-center font-bold">
        ✓ Page Loaded - {isStreaming ? 'STREAMING' : 'READY'} - {analysisCount} analyses
      </div>
      
      {/* Navbar in try-catch */}
      <div>
        <Navbar />
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-5xl font-bold flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200">
            <Radio className="w-10 h-10 text-cyan-400 animate-pulse" />
            Live Voice Analysis
          </h1>
          <p className="text-gray-400">Real-time microphone streaming with AI fraud detection</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-500/50 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {/* Quick Action - BIG BUTTON */}
        <div className="mb-8">
          {!isStreaming ? (
            <button
              onClick={startLiveStream}
              disabled={isConnecting}
              className="w-full px-8 py-6 bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-bold rounded-xl hover:from-cyan-400 hover:to-cyan-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-2xl shadow-lg"
            >
              <Mic className="w-8 h-8" />
              {isConnecting ? '⏳ Connecting...' : '🎤 START LIVE STREAM'}
            </button>
          ) : (
            <button
              onClick={stopLiveStream}
              className="w-full px-8 py-6 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-xl hover:from-red-500 hover:to-red-400 transition flex items-center justify-center gap-3 text-2xl shadow-lg animate-pulse"
            >
              <Square className="w-8 h-8" />
              ⏹ STOP STREAMING
            </button>
          )}
        </div>

        {/* Status Bar - UPDATED WITH ANALYSES COUNT */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {isStreaming ? '● LIVE' : '○ OFFLINE'}
                </p>
              </div>
              {isStreaming && <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <p className="text-gray-400 text-sm">Risk Level</p>
              <p className="text-2xl font-bold text-red-400">
                {getRiskLevel(riskScore)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <p className="text-gray-400 text-sm">Risk Score</p>
              <p className="text-2xl font-bold text-orange-400">
                {riskScore.toFixed(1)}/100
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <p className="text-gray-400 text-sm">Analyses</p>
              <p className="text-2xl font-bold text-cyan-400">
                {analysisCount}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* DEBUG: Show when we have analysis data */}
        {currentAnalysis && (
          <div className="bg-amber-500/20 border border-amber-500 rounded-lg p-4">
            <p className="text-amber-300 text-sm">✓ Analysis data received and in state</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Stream Control & Waveform */}
          <div className="lg:col-span-2 space-y-6">
            {/* Waveform Visualization */}
            {isStreaming && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="bg-slate-800/80 border-b border-slate-700">
                  <CardTitle className="flex items-center gap-2 text-cyan-400">
                    <Zap className="w-5 h-5" />
                    Real-Time Waveform
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Waveform data={waveformData} height={250} />
                </CardContent>
              </Card>
            )}

            {/* 4-Component Analysis Display */}
            {currentAnalysis && currentAnalysis.components && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="bg-slate-800/80 border-b border-slate-700">
                  <CardTitle className="text-cyan-400">4-Agent Risk Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Cognitive Component */}
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                      <p className="text-gray-400 text-sm font-semibold">🧠 Cognitive (Linguistic)</p>
                      <p className="text-3xl font-bold text-blue-400">{currentAnalysis.components.cognitive?.toFixed(1)}</p>
                      <p className="text-xs text-gray-500 mt-1">Filler words, pauses, naturalness</p>
                    </div>

                    {/* Behavioral Component */}
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                      <p className="text-gray-400 text-sm font-semibold">💓 Behavioral (Biometric)</p>
                      <p className="text-3xl font-bold text-purple-400">{currentAnalysis.components.behavioral?.toFixed(1)}</p>
                      <p className="text-xs text-gray-500 mt-1">Pitch, speech rate, stability</p>
                    </div>

                    {/* Environmental Component */}
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                      <p className="text-gray-400 text-sm font-semibold">🌍 Environmental (Acoustic)</p>
                      <p className="text-3xl font-bold text-green-400">{currentAnalysis.components.environmental?.toFixed(1)}</p>
                      <p className="text-xs text-gray-500 mt-1">Noise, ZCR, frequency patterns</p>
                    </div>

                    {/* Liveness Component */}
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                      <p className="text-gray-400 text-sm font-semibold">✨ Liveness Detection</p>
                      <p className="text-3xl font-bold text-yellow-400">{currentAnalysis.components.liveness?.toFixed(1)}</p>
                      <p className="text-xs text-gray-500 mt-1">Live speaker vs synthetic</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Audio Features */}
            {currentAnalysis && currentAnalysis.features && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="bg-slate-800/80 border-b border-slate-700">
                  <CardTitle className="text-cyan-400">Voice Features</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'RMS Energy', value: currentAnalysis.features.rms_energy?.toFixed(4) },
                      { label: 'ZCR Rate', value: currentAnalysis.features.zero_crossing_rate?.toFixed(4) },
                      { label: 'Centroid', value: currentAnalysis.features.spectral_centroid?.toFixed(0), unit: ' Hz' },
                      { label: 'Rolloff', value: currentAnalysis.features.spectral_rolloff?.toFixed(0), unit: ' Hz' },
                      { label: 'Tempo', value: currentAnalysis.features.tempo?.toFixed(0), unit: ' BPM' },
                      { label: 'Pitch Mean', value: currentAnalysis.features.pitch_mean?.toFixed(0), unit: ' Hz' },
                      { label: 'Pitch Variance', value: currentAnalysis.features.pitch_var?.toFixed(1) },
                      { label: 'Duration', value: currentAnalysis.features.duration?.toFixed(2), unit: ' s' },
                    ].filter(f => f.value !== undefined && f.value !== 'NaN').map(f => (
                      <div key={f.label} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                        <p className="text-gray-400 text-xs">{f.label}</p>
                        <p className="text-sm font-bold text-cyan-400">{f.value}{f.unit || ''}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Artifact Detection */}
            {currentAnalysis && currentAnalysis.artifacts && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="bg-slate-800/80 border-b border-slate-700">
                  <CardTitle className="text-cyan-400">Artifact Detection</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: '🤖 Robotic Voice', key: 'robotic_voice' },
                      { label: '🔊 Clipping', key: 'clipping' },
                      { label: '🎭 Fake Audio', key: 'fake_audio' },
                      { label: '🔔 Echo', key: 'echo' },
                      { label: '🔇 Background Noise', key: 'background_noise' },
                      { label: '⚠️ Fraud Risk', key: 'fraud_risk' },
                    ].map(artifact => (
                      <div 
                        key={artifact.key}
                        className={`p-3 rounded-lg border ${
                          currentAnalysis.artifacts[artifact.key] 
                            ? 'bg-red-500/10 border-red-500 text-red-300' 
                            : 'bg-green-500/10 border-green-500 text-green-300'
                        }`}
                      >
                        <p className="text-sm font-semibold">
                          {artifact.label}: {currentAnalysis.artifacts[artifact.key] ? '✗ DETECTED' : '✓ CLEAR'}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Risk Meter & Security Info */}
          <div className="space-y-6">
            {/* Risk Meter */}
            {currentAnalysis && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="bg-slate-800/80 border-b border-slate-700">
                  <CardTitle className="text-cyan-400">Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex items-center justify-center">
                  <RiskMeter score={riskScore} />
                </CardContent>
              </Card>
            )}

            {/* Recommendation */}
            {currentAnalysis && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="bg-slate-800/80 border-b border-slate-700">
                  <CardTitle className="text-cyan-400">Recommendation</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className={`p-4 rounded-lg border-2 text-center ${getRecommendationColor(currentAnalysis.recommendation)}`}>
                    <p className="text-sm font-semibold">{currentAnalysis.recommendation}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Voice Quality */}
            {currentAnalysis?.quality && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="bg-slate-800/80 border-b border-slate-700">
                  <CardTitle className="text-cyan-400">Voice Quality</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-cyan-400">
                      {currentAnalysis.quality.quality_score}/100
                    </p>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Voice Detected', value: currentAnalysis.quality.has_voice },
                      { name: 'Natural Speech', value: currentAnalysis.quality.natural_speech },
                      { name: 'Good Frequency', value: currentAnalysis.quality.good_frequency },
                      { name: 'Consistent Pitch', value: currentAnalysis.quality.consistent_pitch }
                    ].map(item => (
                      <div key={item.name} className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-700">
                        <span className="text-sm text-gray-300">{item.name}</span>
                        <Badge className={item.value ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                          {item.value ? '✓' : '✗'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Artifacts */}
            {currentAnalysis?.artifacts && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="bg-slate-800/80 border-b border-slate-700">
                  <CardTitle className="text-cyan-400">Artifact Detection</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-2">
                  {Object.entries(currentAnalysis.artifacts || {}).map(([name, detected]: [string, any]) => (
                    <div key={name} className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-700">
                      <span className="text-sm text-gray-300 capitalize">{name.replace(/_/g, ' ')}</span>
                      <Badge className={detected ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}>
                        {detected ? 'Detected' : 'Clear'}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Analysis History */}
        {analysisHistory.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="bg-slate-800/80 border-b border-slate-700">
              <CardTitle className="flex items-center gap-2 text-cyan-400">
                <TrendingUp className="w-5 h-5" />
                Analysis Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {analysisHistory.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 rounded border border-slate-700 hover:border-slate-600 transition">
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm">
                        {entry.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-mono text-cyan-400 font-bold">
                          {entry.riskScore.toFixed(1)}
                        </p>
                        <p className="text-gray-400 text-xs">Risk</p>
                      </div>
                      <Badge className={`${getRecommendationColor(entry.recommendation)} border`}>
                        {entry.recommendation.split('_')[0]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
