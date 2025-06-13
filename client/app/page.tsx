"use client";
import Image from "next/image";
import { SignedIn, SignedOut, SignUpButton, UserButton } from "@clerk/nextjs";
import { useRef, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Cookies from 'js-cookie';

// Define interfaces
interface UserState {
  fullName: string | null;
  email: string | null;
  lastActive: string;
}

interface Reference {
  text: string;
  page?: number;
  source?: string;
}

interface Message {
  text: string;
  isUser: boolean;
  references?: Reference[];
}

export default function Home() {

  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! How can I assist you today?", isUser: false }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [userState, setUserState] = useState<UserState>({
    fullName: null,
    email: null,
    lastActive: new Date().toISOString()
  });

  // Load user state from cookies on component mount
  useEffect(() => {
    const savedUserState = Cookies.get('userState');
    if (savedUserState) {
      setUserState(JSON.parse(savedUserState));
    }
  }, []);

  // Update user state and cookies when user data changes
  useEffect(() => {
    if (user) {
      const newUserState = {
        fullName: user.fullName,
        email: user.primaryEmailAddress?.emailAddress || null,
        lastActive: new Date().toISOString()
      };
      setUserState(newUserState);
      Cookies.set('userState', JSON.stringify(newUserState), { expires: 7 }); // Expires in 7 days
    }
  }, [user]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploadStatus('loading');
      setUploadMessage('Uploading...');
      setJobId(null);
      const formData = new FormData();
      formData.append('file', files[0]);

      try {
        const response = await fetch('http://localhost:8000/upload', {
          method: 'POST',
          body: formData,
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          console.error('Upload failed:', data.message);
          setUploadStatus('error');
          setUploadMessage(data.message || 'Upload failed. Please try again.');
          return;
        }
        
        console.log('Upload successful:', data);
        setUploadStatus('success');
        setJobId(data.jobId);
        setUploadMessage(`File uploaded successfully! Processing job ID: ${data.jobId}`);
        
        // Reset success state after 5 seconds
        setTimeout(() => {
          setUploadStatus('idle');
          setUploadMessage('');
          setJobId(null);
        }, 5000);
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadStatus('error');
        setUploadMessage('Network error. Please try again.');
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: inputMessage, isUser: true }]);
    setInputMessage('');

    try {
      const response = await fetch(`http://localhost:8000/chat?message=${encodeURIComponent(inputMessage)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      // Add AI response with references
      setMessages(prev => [...prev, { 
        text: data.message || "I'm sorry, I couldn't process that request.", 
        isUser: false,
        references: data.docs?.map((doc: any) => ({
          text: doc.pageContent,
          page: doc.metadata?.page,
          source: doc.metadata?.source
        }))
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { text: "Sorry, there was an error processing your message.", isUser: false }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleDownload = async (source: string) => {
    try {
      const response = await fetch(`http://localhost:8000/download?file=${encodeURIComponent(source)}`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = source.split('/').pop() || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      // You might want to show a toast notification here
    }
  };

  const renderUploadIcon = () => {
    switch (uploadStatus) {
      case 'loading':
        return (
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2 md:mb-3 animate-spin">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-2 md:mb-3">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-2 md:mb-3">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2 md:mb-3">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="h-[calc(108vh-4rem)] bg-white dark:bg-black">
      <SignedIn>
        <div className="flex flex-col md:flex-row h-full">
          {/* Left Side - File Upload Area */}
          <div className="w-full md:w-1/2 p-4 md:p-6 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800">
            <div className="h-[40vh] md:h-full flex flex-col">
              <h2 className="text-xl md:text-2xl font-bold text-black dark:text-white mb-3 md:mb-4">Upload Documents</h2>
              <div className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 md:p-6 flex flex-col items-center justify-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                  multiple
                />
                {renderUploadIcon()}
                <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-2 text-center">
                  {uploadMessage || 'Drag and drop your files here'}
                </p>
                {jobId && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
                    Job ID: {jobId}
                  </p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-2 md:mb-3">or</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadStatus === 'loading'}
                  className={`px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg transition-colors text-sm md:text-base ${
                    uploadStatus === 'loading' 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-gray-800 dark:hover:bg-gray-200'
                  }`}
                >
                  Browse Files
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 md:mt-3">Supported formats: PDF, DOCX, TXT</p>
              </div>
            </div>
          </div>

          {/* Right Side - Chat Interface */}
          <div className="w-full md:w-1/2 p-4 md:p-6">
            <div className="h-[60vh] md:h-full flex flex-col">
              <div className="bg-white dark:bg-black rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800 flex-1 flex flex-col">
                <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <div className="w-7 h-7 md:w-8 md:h-8 dark:bg-white rounded-full flex items-center justify-center">
                      <span className="text-white dark:text-black font-bold text-xs md:text-sm">
                        <UserButton />
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-black dark:text-white text-sm md:text-base">
                        {userState.fullName || 'Guest User'}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Last active: {new Date(userState.lastActive).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-start space-x-2 md:space-x-3">
                        <div className="w-5 h-5 md:w-6 md:h-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <span className="text-black dark:text-white text-xs">{message.isUser ? 'U' : 'AI'}</span>
                        </div>
                        <div className={`font-[Cool] ${message.isUser ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'} rounded-lg p-2 md:p-3 max-w-[80%]`}>
                          <p className="font-[Cool] text-black dark:text-white text-sm md:text-base">{message.text}</p>
                        </div>
                      </div>
                      
                      {/* Reference Cards */}
                      {!message.isUser && message.references && message.references.length > 0 && (
                        <div className="ml-8 space-y-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">References:</p>
                          <div className="grid grid-cols-1 gap-2">
                            {message.references.map((ref, refIndex) => (
                              <div 
                                key={refIndex}
                                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-xs"
                              >
                                <p className="text-gray-700 dark:text-gray-300 mb-1">{ref.text}</p>
                                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                                  {ref.source && (
                                    <button
                                      onClick={() => handleDownload(ref.source!)}
                                      className="flex items-center hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer"
                                    >
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      {ref.source}
                                    </button>
                                  )}
                                  {ref.page && (
                                    <span className="flex items-center">
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                                      </svg>
                                      Page {ref.page}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-2 md:p-3 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center space-x-2 md:space-x-4">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white text-sm md:text-base"
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                      className={`px-3 md:px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg transition-colors text-sm md:text-base ${
                        !inputMessage.trim() 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:bg-gray-800 dark:hover:bg-gray-200'
                      }`}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        {/* Landing Page for Non-authenticated Users */}
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center text-center space-y-8">
            <h1 className="font-[Lemon] text-5xl font-bold text-black dark:text-white">
              Your AI Chat Assistant
            </h1>
            <p className="font-[Cool] text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
              Experience the power of AI-driven conversations. Get instant answers, insights, and assistance with our advanced chatbot.
            </p>
            <button className="font-sans px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
            <SignUpButton /> Now!
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white dark:bg-black rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-[Cool] text-xl font-semibold mb-2 text-black dark:text-white">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-400">Get instant responses to your questions with our optimized AI model.</p>
            </div>
            
            <div className="p-6 bg-white dark:bg-black rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-[Cool] text-xl font-semibold mb-2 text-black dark:text-white">Secure & Private</h3>
              <p className="text-gray-600 dark:text-gray-400">Your conversations are encrypted and protected with enterprise-grade security.</p>
            </div>
            
            <div className="p-6 bg-white dark:bg-black rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className=" font-[Cool] text-xl font-semibold mb-2 text-black dark:text-white">Smart & Intuitive</h3>
              <p className="text-gray-600 dark:text-gray-400">Advanced AI that understands context and provides relevant, helpful responses.</p>
            </div>
          </div>
        </div>
      </SignedOut>
    </div>
  );
}
