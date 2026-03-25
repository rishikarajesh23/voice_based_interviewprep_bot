export class AudioService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;


  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];


      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };


      this.mediaRecorder.start();
      this.isRecording = true;
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }


  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('Not recording'));
        return;
      }


      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.audioChunks = [];
        resolve(audioBlob);
      };


      this.mediaRecorder.stop();
      this.isRecording = false;


      // Stop all tracks
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  }


  async playAudio(audioBase64: string): Promise<void> {
    const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
    return audio.play();
  }


  getRecordingStatus(): boolean {
    return this.isRecording;
  }
}


export const audioService = new AudioService();
