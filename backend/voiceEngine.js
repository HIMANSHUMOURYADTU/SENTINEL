/**
 * Voice Analysis Engine - Pure Node.js Implementation
 * Provides real-time audio analysis for fraud detection
 * Features: Quality scoring, artifact detection, risk assessment
 */

import * as fs from 'fs';

/**
 * Advanced Audio Analysis Engine
 * Processes WAV and raw audio data for fraud detection
 */
export class VoiceAnalysisEngine {
  constructor() {
    this.sampleRate = 16000;
    this.frameSize = 512;
  }

  /**
   * Parse WAV file header and extract audio data
   */
  parseWAV(buffer) {
    try {
      // Simple WAV parser for 16-bit PCM
      const view = new DataView(buffer);
      
      // Find data chunk
      let dataStart = 0;
      for (let i = 0; i < buffer.byteLength - 4; i++) {
        if (view.getUint8(i) === 0x64 && // 'd'
            view.getUint8(i + 1) === 0x61 && // 'a'
            view.getUint8(i + 2) === 0x74 && // 't'
            view.getUint8(i + 3) === 0x61) { // 'a'
          dataStart = i + 8;
          break;
        }
      }

      // Convert PCM bytes to float array
      const audioData = [];
      for (let i = dataStart; i < buffer.byteLength - 1; i += 2) {
        const sample = view.getInt16(i, true) / 32768.0;
        audioData.push(sample);
      }

      return audioData;
    } catch (error) {
      console.error('WAV parsing error:', error);
      return null;
    }
  }

  /**
   * Extract comprehensive audio features
   */
  extractFeatures(audioData) {
    if (!audioData || audioData.length === 0) return null;

    const features = {};

    // Duration
    features.duration = audioData.length / this.sampleRate;

    // RMS Energy
    const rmsValues = this._calculateRMS(audioData);
    features.rms_mean = this._mean(rmsValues);
    features.rms_std = this._std(rmsValues);
    features.rms_max = Math.max(...rmsValues);

    // Zero Crossing Rate (ZCR) - voice detection
    const zcr = this._calculateZCR(audioData);
    features.zcr_mean = this._mean(zcr);
    features.zcr_std = this._std(zcr);

    // Spectral features via FFT
    const spectralData = this._calculateSpectral(audioData);
    features.spec_centroid_mean = spectralData.centroid;
    features.spec_rolloff_mean = spectralData.rolloff;
    features.spec_entropy = spectralData.entropy;

    // MFCC approximation (simplified)
    features.mfcc_mean = spectralData.mfcc;
    features.mfcc_std = spectralData.mfcc_std;

    // Pitch estimation via autocorrelation
    const pitchData = this._estimatePitch(audioData);
    features.tempo = pitchData.tempo;
    features.pitch_stability = pitchData.stability;

    // Loudness variance
    features.loudness_variance = this._calculateLoudnessVariance(rmsValues);

    return features;
  }

  /**
   * Calculate RMS energy in frames
   */
  _calculateRMS(audioData) {
    const rms = [];
    for (let i = 0; i < audioData.length; i += this.frameSize) {
      const frame = audioData.slice(i, i + this.frameSize);
      const sumSquares = frame.reduce((sum, x) => sum + x * x, 0);
      rms.push(Math.sqrt(sumSquares / frame.length));
    }
    return rms;
  }

  /**
   * Calculate Zero Crossing Rate
   */
  _calculateZCR(audioData) {
    const zcr = [];
    for (let i = 0; i < audioData.length; i += this.frameSize) {
      const frame = audioData.slice(i, i + this.frameSize);
      let crossings = 0;
      for (let j = 1; j < frame.length; j++) {
        if ((frame[j] >= 0 && frame[j - 1] < 0) || 
            (frame[j] < 0 && frame[j - 1] >= 0)) {
          crossings++;
        }
      }
      zcr.push(crossings / frame.length);
    }
    return zcr;
  }

  /**
   * Calculate spectral features
   */
  _calculateSpectral(audioData) {
    // Simple FFT using Cooley-Tukey algorithm
    const fft = this._simpleFFT(audioData.slice(0, Math.min(2048, audioData.length)));
    
    // Calculate magnitude spectrum
    const magnitude = fft.map(c => Math.sqrt(c.real * c.real + c.imag * c.imag));
    
    // Normalize
    const maxMag = Math.max(...magnitude);
    const normalized = magnitude.map(m => m / maxMag);

    // Spectral centroid
    let weightedSum = 0;
    let totalMag = 0;
    for (let i = 0; i < normalized.length; i++) {
      const freq = (i * this.sampleRate) / normalized.length;
      weightedSum += freq * normalized[i];
      totalMag += normalized[i];
    }
    const centroid = weightedSum / totalMag;

    // Spectral rolloff (95% of energy)
    let energySum = 0;
    let rolloff = 0;
    const totalEnergy = normalized.reduce((a, b) => a + b, 0);
    for (let i = 0; i < normalized.length; i++) {
      energySum += normalized[i];
      if (energySum > totalEnergy * 0.95) {
        rolloff = (i * this.sampleRate) / normalized.length;
        break;
      }
    }

    // Spectral entropy
    const entropy = -normalized.reduce((sum, p) => {
      return sum + (p > 0 ? p * Math.log2(p) : 0);
    }, 0);

    // MFCC approximation (simplified - using spectral bands)
    const bands = this._calculateMelBands(normalized);
    const mfccMean = this._mean(bands);
    const mfccStd = this._std(bands);

    return {
      centroid: centroid / this.sampleRate,
      rolloff: rolloff / this.sampleRate,
      entropy: entropy,
      mfcc: mfccMean,
      mfcc_std: mfccStd
    };
  }

  /**
   * Estimate pitch and tempo
   */
  _estimatePitch(audioData) {
    // Autocorrelation-based pitch estimation
    const maxLag = Math.floor(this.sampleRate / 80); // 80Hz minimum
    const minLag = Math.floor(this.sampleRate / 400); // 400Hz maximum

    let maxCorr = 0;
    let pitchLag = minLag;

    for (let lag = minLag; lag < maxLag; lag++) {
      let corr = 0;
      for (let i = 0; i < audioData.length - lag; i++) {
        corr += audioData[i] * audioData[i + lag];
      }
      if (corr > maxCorr) {
        maxCorr = corr;
        pitchLag = lag;
      }
    }

    const fundamentalFreq = this.sampleRate / pitchLag;
    const tempo = fundamentalFreq * 1.5; // Approximate tempo in BPM

    // Pitch stability (variance of pitch)
    const stability = 1 / (1 + Math.abs(fundamentalFreq - 200) / 200); // Normalized to ~200Hz

    return {
      tempo: tempo,
      stability: stability
    };
  }

  /**
   * Calculate Mel-band energies (MFCC approximation)
   */
  _calculateMelBands(spectrum) {
    const numBands = 13;
    const bands = [];
    const bandSize = Math.floor(spectrum.length / numBands);

    for (let i = 0; i < numBands; i++) {
      const start = i * bandSize;
      const end = (i + 1) * bandSize;
      const bandEnergy = spectrum.slice(start, end).reduce((a, b) => a + b, 0);
      bands.push(bandEnergy / bandSize);
    }

    return bands;
  }

  /**
   * Simple FFT implementation
   */
  _simpleFFT(input) {
    const N = input.length;
    if (N <= 1) return input.map(x => ({ real: x, imag: 0 }));

    // Base case
    if (N === 2) {
      return [
        { real: input[0] + input[1], imag: 0 },
        { real: input[0] - input[1], imag: 0 }
      ];
    }

    // Divide
    const even = this._simpleFFT(input.filter((_, i) => i % 2 === 0));
    const odd = this._simpleFFT(input.filter((_, i) => i % 2 === 1));

    // Combine
    const result = [];
    for (let k = 0; k < N / 2; k++) {
      const angle = (-2 * Math.PI * k) / N;
      const wr = Math.cos(angle);
      const wi = Math.sin(angle);

      const real = odd[k].real * wr - odd[k].imag * wi;
      const imag = odd[k].real * wi + odd[k].imag * wr;

      result[k] = {
        real: even[k].real + real,
        imag: even[k].imag + imag
      };
      result[k + N / 2] = {
        real: even[k].real - real,
        imag: even[k].imag - imag
      };
    }

    return result;
  }

  /**
   * Analyze voice quality
   */
  analyzeQuality(features) {
    if (!features) return null;

    let qualityScore = 0;

    // Check for voice presence
    if (features.rms_mean > 0.05) qualityScore += 20;

    // Check for natural speech patterns
    if (0.15 < features.zcr_mean < 0.5) qualityScore += 20;

    // Check for spectral diversity
    if (features.spec_rolloff_mean > 0.3) qualityScore += 20;

    // Check for pitch consistency
    if (features.pitch_stability > 0.5) qualityScore += 20;

    // Check for natural duration
    if (1 < features.duration < 30) qualityScore += 20;

    return {
      quality_score: qualityScore,
      has_voice: features.rms_mean > 0.05,
      natural_speech: 0.15 < features.zcr_mean && features.zcr_mean < 0.5,
      good_frequency: features.spec_rolloff_mean > 0.3,
      consistent_pitch: features.pitch_stability > 0.5,
      natural_duration: 1 < features.duration && features.duration < 30
    };
  }

  /**
   * Detect artifacts
   */
  detectArtifacts(features) {
    if (!features) return null;

    const artifacts = {
      robotic_voice: features.rms_std < 0.01,
      heavy_background: features.zcr_mean > 0.6,
      clipping: features.rms_max > 0.9,
      fake_audio: features.mfcc_std < 0.05 || features.mfcc_std > 50,
      echo_present: Math.abs(features.spec_centroid_mean - features.spec_rolloff_mean) > 0.3
    };

    const artifactCount = Object.values(artifacts).filter(v => v).length;

    return {
      artifacts: artifacts,
      artifact_count: artifactCount,
      artifact_score: Math.min(100, artifactCount * 25)
    };
  }

  /**
   * Calculate fraud risk
   */
  calculateFraudRisk(features) {
    if (!features) return 50;

    let riskScore = 50;

    // Quality analysis
    const quality = this.analyzeQuality(features);
    if (quality.quality_score < 40) riskScore += 15;

    // Artifact analysis
    const artifacts = this.detectArtifacts(features);
    riskScore += artifacts.artifact_score;

    // Feature consistency
    if (features.rms_std < 0.01) riskScore += 20;

    // Speech rate
    if (features.tempo > 300) riskScore += 15;

    // Cap at 100
    riskScore = Math.min(100, Math.max(0, riskScore));

    return riskScore;
  }

  /**
   * Get recommendation based on risk
   */
  getRecommendation(riskScore) {
    if (riskScore > 75) return 'BLOCK_IMMEDIATE';
    if (riskScore > 50) return 'CHALLENGE_REQUIRED';
    return 'ALLOW';
  }

  /**
   * Process audio - complete analysis
   */
  processAudio(audioBuffer) {
    try {
      // Parse audio
      const audioData = this.parseWAV(audioBuffer);
      if (!audioData) return null;

      // Extract features
      const features = this.extractFeatures(audioData);
      if (!features) return null;

      // Analyze
      const quality = this.analyzeQuality(features);
      const artifacts = this.detectArtifacts(features);
      const fraudRisk = this.calculateFraudRisk(features);

      return {
        features: {
          duration: features.duration,
          rms_mean: features.rms_mean,
          zcr_mean: features.zcr_mean,
          spec_centroid_mean: features.spec_centroid_mean,
          spec_rolloff_mean: features.spec_rolloff_mean,
          tempo: features.tempo,
          mfcc_mean: features.mfcc_mean
        },
        quality: quality,
        artifacts: artifacts,
        fraud_risk: fraudRisk,
        recommendation: this.getRecommendation(fraudRisk)
      };
    } catch (error) {
      console.error('Audio processing error:', error);
      return null;
    }
  }

  /**
   * Utility: Calculate mean
   */
  _mean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  /**
   * Utility: Calculate standard deviation
   */
  _std(arr) {
    const mean = this._mean(arr);
    const variance = arr.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
  }

  /**
   * Utility: Calculate loudness variance
   */
  _calculateLoudnessVariance(rmsValues) {
    const mean = this._mean(rmsValues);
    return rmsValues.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / rmsValues.length;
  }
}

export default VoiceAnalysisEngine;
