import React, { useState, useRef, useCallback } from 'react';
import { 
    Box, 
    Card, 
    CardContent, 
    Typography, 
    Button, 
    LinearProgress, 
    Alert,
    Chip,
    Stack,
    Paper
} from '@mui/material';
import {
    Mic,
    Stop,
    Upload,
    VolumeUp
} from '@mui/icons-material';
import AppLayout from '../components/Layout/AppLayout';

interface VoiceRecording {
    id: string;
    fileName: string;
    transcription: string | null;
    processingStatus: 'pending' | 'transcribing' | 'generating' | 'complete' | 'failed';
    errorMessage: string | null;
    createdAt: string;
}

export default function VoiceAIPage() {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [recordings, setRecordings] = useState<VoiceRecording[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                setAudioBlob(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            setError('Failed to access microphone. Please check permissions.');
            console.error('Error starting recording:', error);
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    const uploadAudio = useCallback(async (blob: Blob, fileName: string = 'voice-memo.wav') => {
        setIsUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('audio', blob, fileName);

            const response = await fetch('/api/voice-ai/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload audio');
            }

            const result = await response.json();
            setRecordings(prev => [result.recording, ...prev]);
            setAudioBlob(null);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            setError(errorMessage);
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
        }
    }, []);

    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            uploadAudio(file, file.name);
        }
    }, [uploadAudio]);

    const getStatusColor = (status: VoiceRecording['processingStatus']): 'success' | 'error' | 'warning' | 'default' => {
        switch (status) {
            case 'complete': return 'success';
            case 'failed': return 'error';
            case 'pending': 
            case 'transcribing': 
            case 'generating': return 'warning';
            default: return 'default';
        }
    };

    const getStatusText = (status: VoiceRecording['processingStatus']) => {
        switch (status) {
            case 'pending': return 'Queued';
            case 'transcribing': return 'Transcribing Audio';
            case 'generating': return 'Generating Proposals';
            case 'complete': return 'Complete';
            case 'failed': return 'Failed';
            default: return status;
        }
    };

    return (
        <AppLayout>
            <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                    🎙️ Voice AI Proposal Generator
                </Typography>

                <Card sx={{ mb: 4 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Record Voice Memo
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Record a 30-second voice memo describing your smart home project, and our AI will generate professional proposals.
                        </Typography>

                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                            {!isRecording ? (
                                <Button
                                    variant="contained"
                                    startIcon={<Mic />}
                                    onClick={startRecording}
                                    size="large"
                                    color="primary"
                                >
                                    Start Recording
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    startIcon={<Stop />}
                                    onClick={stopRecording}
                                    size="large"
                                    color="error"
                                >
                                    Stop Recording
                                </Button>
                            )}

                            <Typography variant="body2">or</Typography>

                            <Button
                                variant="outlined"
                                startIcon={<Upload />}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Upload Audio File
                            </Button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="audio/*"
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                            />
                        </Stack>

                        {isRecording && (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                🎤 Recording in progress... Speak clearly about your smart home project.
                            </Alert>
                        )}

                        {audioBlob && (
                            <Paper sx={{ p: 2, mb: 2 }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <VolumeUp color="primary" />
                                    <Typography variant="body2">
                                        Recording ready for upload
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        onClick={() => uploadAudio(audioBlob)}
                                        disabled={isUploading}
                                        startIcon={<Upload />}
                                    >
                                        {isUploading ? 'Uploading...' : 'Generate Proposals'}
                                    </Button>
                                </Stack>
                                {isUploading && <LinearProgress sx={{ mt: 1 }} />}
                            </Paper>
                        )}

                        {error && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                <Typography variant="h5" gutterBottom>
                    Recent Voice Recordings
                </Typography>

                {recordings.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                            No recordings yet. Start by recording a voice memo above.
                        </Typography>
                    </Paper>
                ) : (
                    <Stack spacing={2}>
                        {recordings.map((recording) => (
                            <Card key={recording.id}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {recording.fileName}
                                    </Typography>
                                    <Chip 
                                        label={getStatusText(recording.processingStatus)}
                                        color={getStatusColor(recording.processingStatus)}
                                        size="small"
                                    />
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}
            </Box>
        </AppLayout>
    );
} 