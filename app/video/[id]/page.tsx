'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Video {
  id: string;
  title: string;
  url: string;
  views: number;
  likes: number;
  createdAt: string;
}

export default function VideoPage() {
  const params = useParams();
  const id = params.id as string;
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API || "";
  const normalizedApiUrl = API_URL
    ? API_URL.startsWith("http")
      ? API_URL.replace(/\/$/, "")
      : `https://${API_URL.replace(/\/$/, "")}`
    : "";

  useEffect(() => {
    fetch(`${normalizedApiUrl || ""}/api/videos/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.url && !data.url.startsWith('http')) {
          data.url = data.url;
        }
        setVideo(data);
        console.log("vid=>",data.url)
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id, normalizedApiUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Video not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 to-black text-white">
      <header className="p-6 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-white hover:text-gray-300 transition-colors">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold">MWA3EZ Reels</h1>
          <div></div>
        </div>
      </header>
      <main className="p-6 max-w-4xl mx-auto">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl">
          {videoError ? (
            <div className="w-full h-64 flex items-center justify-center bg-gray-700 text-white">
              <p>Video could not be loaded. The source may not be supported.</p>
            </div>
          ) : (
            <video
              src={video.url}
              className="w-full h-auto"
              controls
              autoPlay
              onError={() => setVideoError(true)}
              onPlay={() => {
                fetch(`https://${API_URL}/api/videos/${id}/views`, { method: 'POST' });
              }}
            />
          )}
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{video.title}</h2>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400">{video.views} views</span>
              <span className="text-gray-400">{new Date(video.createdAt).toLocaleDateString()}</span>
            </div>
            <button
          
              onClick={() => {
                fetch(`https://${API_URL}/api/videos/${id}/likes`, { method: 'POST' })
                  .then(() => {
                    setVideo({ ...video, likes: video.likes + 1 });
                  });
              }}
              className="bg-linear-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 px-6 py-3 rounded-full text-white font-medium transition-all duration-200 transform hover:scale-110 flex items-center gap-2"
            >
              ❤️ {video.likes} Likes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}