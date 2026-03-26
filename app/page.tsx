"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";

interface Video {
  id: string;
  title: string;
  url: string;
  views: number;
  likes: number;
  createdAt: string;
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLongPress, setIsLongPress] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API;
  useEffect(() => {
    fetch(`http://${API_URL}/api/videos`)
      .then((res) => res.json())
      .then((data) => {
        const videosWithFullUrl = data.map((video: Video) => {
          if (video.url && !video.url.startsWith("http")) {
            video.url = video.url;
          }
          return video;
        });
        setVideos(videosWithFullUrl);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0 && currentVideoIndex < videos.length - 1) {
        setVideoError(null);
        setIsPlaying(true);
        setCurrentVideoIndex(currentVideoIndex + 1);
      } else if (e.deltaY < 0 && currentVideoIndex > 0) {
        setVideoError(null);
        setIsPlaying(true);
        setCurrentVideoIndex(currentVideoIndex - 1);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endY = e?.touches[0]?.clientY;
      const diffY = startY - endY;
      if (Math.abs(diffY) > 50) {
        if (diffY > 0 && currentVideoIndex < videos.length - 1) {
          setVideoError(null);
          setIsPlaying(true);
          setCurrentVideoIndex(currentVideoIndex + 1);
        } else if (diffY < 0 && currentVideoIndex > 0) {
          setVideoError(null);
          setIsPlaying(true);
          setCurrentVideoIndex(currentVideoIndex - 1);
        }
      }
    };

    let startY: number;

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [currentVideoIndex, videos.length]);

  useEffect(() => {
    if (videoRef.current && !videoError) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [currentVideoIndex, videoError, isPlaying]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">No videos available</div>
      </div>
    );
  }

  const currentVideo = videos[currentVideoIndex];
  const vid = () => {
    if (videoRef.current && !videoError) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <header className="absolute top-0 left-0 right-0 p-6 bg-black/50 backdrop-blur-sm z-10">
        <h1 className="text-2xl font-bold text-center">MWA3EZ Reels</h1>
      </header>
      <main className="h-screen flex items-center justify-center">
        <div
          className="relative w-full h-full md:p-10 max-md:max-w-md mx-auto"
          onTouchStart={() => {
            longPressTimerRef.current = setTimeout(() => {
              setIsLongPress(true);
              if (videoRef.current) {
                videoRef.current.playbackRate = 2;
              }
            }, 500);
          }}
          onTouchEnd={() => {
            if (longPressTimerRef.current) {
              clearTimeout(longPressTimerRef.current);
            }
            if (isLongPress) {
              setIsLongPress(false);
              if (videoRef.current) {
                videoRef.current.playbackRate = 1;
              }
            } else {
              setIsPlaying(!isPlaying);
            }
          }}
        >
          {videoError ? (
            <div className="flex flex-col items-center justify-center h-full bg-black text-white">
              <p className="text-center mb-4">{videoError}</p>
              <button
                onClick={() => {
                  setVideoError(null);
                  setIsPlaying(true);
                  if (currentVideoIndex < videos.length - 1) {
                    setCurrentVideoIndex(currentVideoIndex + 1);
                  }
                }}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-full text-white font-medium"
              >
                Skip Video
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              src={currentVideo.url}
              className="w-full h-full "
              loop
              playsInline
              onPlay={() =>
                fetch(`http://${API_URL}/api/videos/${currentVideo.id}/views`, {
                  method: "POST",
                }).then(() => {
                  setVideos(
                    videos.map((v) =>
                      v.id === currentVideo.id
                        ? { ...v, views: v.views + 1 }
                        : v
                    )
                  );
                })
              }
              onError={() =>
                setVideoError(
                  "فشل في تحميل الفيديو. ربما الرابط غير صحيح أو الخادم غير متاح."
                )
              }
            />
          )}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
            <h2 className="text-lg font-semibold mb-2">{currentVideo.title}</h2>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-300 text-sm">
                {currentVideo.views} views
              </span>
              <span className="text-gray-300 text-sm">
                {new Date(currentVideo.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  fetch(
                    `http://${API_URL}/api/videos/${currentVideo.id}/likes`,
                    { method: "POST" }
                  ).then(() => {
                    setVideos(
                      videos.map((v) =>
                        v.id === currentVideo.id
                          ? { ...v, likes: v.likes + 1 }
                          : v
                      )
                    );
                  });
                }}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full text-white font-medium flex items-center gap-2"
              >
                ❤️ {currentVideo.likes}
              </button>
              <Link
              href={`/video/${currentVideo.id}`
                }
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-full text-white"
              >
                View Details
              </Link>
            </div>
          </div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
            {videos.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentVideoIndex ? "bg-white" : "bg-gray-500"
                }`}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
