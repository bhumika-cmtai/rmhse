"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Script from "next/script";

// Define a type for our video data for type safety
interface VideoData {
  _id: string;
  title: string;
  url: string;
  public_id: string;
}

const ManageVideoPage = () => {
  // State to hold the current video's data
  const [currentVideo, setCurrentVideo] = useState<VideoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  // Function to fetch the current video from the backend
  const fetchCurrentVideo = async () => {
    try {
      setIsLoading(true);
      // Assume your API is running at this base URL
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/video`);
      const data = await response.json();

      if (response.ok && data.data) {
        setCurrentVideo(data.data);
      } else {
        setCurrentVideo(null); // No video is currently set
      }
    } catch (error) {
      console.error("Failed to fetch video:", error);
      setStatusMessage("Error: Could not fetch current video.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch the video when the component mounts
  useEffect(() => {
    fetchCurrentVideo();
  }, []);

  // Function to save the new video details to our server
  const saveDetailsToServer = async (videoInfo: { secure_url: string; public_id: string }) => {
    try {
        // console.log(videoInfo.secure_url)
        // console.log(videoInfo.public_id)
      setStatusMessage("Upload complete! Saving details to server...");
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/video/save-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "About Us Video", // You can add a title field if needed
          url: videoInfo.secure_url,
          public_id: videoInfo.public_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Server failed to save video details.");
      }

      const savedVideo = await response.json();
      setCurrentVideo(savedVideo.data); // Update the UI immediately with the new video
      setStatusMessage("Video successfully replaced!");

    } catch (error) {
      console.error("Failed to save details:", error);
      setStatusMessage("Error: Could not save new video details.");
    }
  };

  // This function is the callback for the Cloudinary Widget
  const processUpload = (error: any, result: any) => {
    if (!error && result && result.event === "success") {
      saveDetailsToServer(result.info);
    } else if (error) {
      console.error("Upload Widget Error:", error);
      setStatusMessage("Error: Upload failed. Please try again.");
    }
  };

  // This function opens the Cloudinary Upload Widget
  const handleReplaceVideo = async () => {
    setStatusMessage("Preparing to upload...");
    
    try {
      // 1. Get a secure signature from our backend
      const signatureResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/video/signature`);
      const signatureData = await signatureResponse.json();

      if (!signatureResponse.ok) {
        throw new Error("Could not get upload signature.");
      }
      
      const { signature, timestamp } = signatureData.data;

      // 2. Create and open the widget with the signature
      const myWidget = (window as any).cloudinary.createUploadWidget({
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
          uploadSignature: signature,
          uploadSignatureTimestamp: timestamp,
          folder: 'videos',
          resourceType: 'video',
      }, processUpload);

      myWidget.open();

    } catch (error) {
      console.error("Failed to open widget:", error);
      setStatusMessage("Error: Could not initiate upload.");
    }
  };


  return (
    <>
      {/* The Cloudinary SDK Script */}
      <Script src="https://upload-widget.cloudinary.com/global/all.js" type="text/javascript" />

      <section className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-4">Manage About Us Video</h1>
        <div className="p-6 border rounded-lg shadow-md bg-white">
          <h2 className="text-xl font-semibold mb-4">Current Video</h2>

          {isLoading ? (
            <p>Loading video...</p>
          ) : currentVideo ? (
            <video
              key={currentVideo.url} // Important: forces re-render on change
              src={currentVideo.url}
              className="rounded-lg w-full max-w-lg"
              controls
            />
          ) : (
            <p className="text-gray-500">No video is currently set.</p>
          )}

          <div className="mt-6">
            <Button onClick={handleReplaceVideo}>
              Replace Video
            </Button>
            {statusMessage && <p className="mt-4 text-sm text-gray-700">{statusMessage}</p>}
          </div>
        </div>
      </section>
    </>
  );
};

export default ManageVideoPage;