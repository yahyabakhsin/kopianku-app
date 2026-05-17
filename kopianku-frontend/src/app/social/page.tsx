"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Heart, MessageCircle, Share2, Star, TrendingUp, Users, Send, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { apiClient } from "@/lib/axios";
import { CreatePostModal } from "@/features/community/components/CreatePostModal";

export default function CommunityPage() {
  const [feedPosts, setFeedPosts] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [postComments, setPostComments] = useState<Record<string, any[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [myTopCafes, setMyTopCafes] = useState<any[]>([]);

  const fetchFeed = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await apiClient.get('/feed', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setFeedPosts(res.data);
    } catch (error) {
      console.error("Gagal load feed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const res = await apiClient.get('/users/me/follows', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFriends(res.data.following || []);
        
        const meRes = await apiClient.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyTopCafes(meRes.data.top_cafes?.slice(0, 3) || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchFriends();
    const handlePostCreated = () => fetchFeed();
    window.addEventListener('postCreated', handlePostCreated);
    return () => window.removeEventListener('postCreated', handlePostCreated);
  }, []);

  const handleSearchUser = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const token = localStorage.getItem("token");
      const res = await apiClient.get(`/users/search?q=${q}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setSearchResults(res.data);
    } catch (error) {
      console.error("Gagal search user", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Login dulu bang buat ngelike!");
      
      const res = await apiClient.post(`/feed/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state for immediate feedback
      setFeedPosts(posts => posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: res.data.status === 'liked' ? post.likes + 1 : post.likes - 1,
            userHasLiked: res.data.status === 'liked'
          };
        }
        return post;
      }));
    } catch (error) {
      console.error("Gagal nge-like", error);
    }
  };

  const toggleComments = async (postId: string) => {
    const isExpanding = !expandedComments[postId];
    setExpandedComments(prev => ({ ...prev, [postId]: isExpanding }));
    
    if (isExpanding && !postComments[postId]) {
      // Fetch comments for the first time
      try {
        const res = await apiClient.get(`/feed/${postId}/comments`);
        setPostComments(prev => ({ ...prev, [postId]: res.data }));
      } catch (error) {
        console.error("Gagal load comments", error);
      }
    }
  };

  const submitComment = async (postId: string) => {
    const text = newComment[postId];
    if (!text || text.trim() === "") return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Login dulu bang buat komen!");

      await apiClient.post(`/feed/${postId}/comments`, { content: text }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Clear input & refresh comments
      setNewComment(prev => ({ ...prev, [postId]: "" }));
      const res = await apiClient.get(`/feed/${postId}/comments`);
      setPostComments(prev => ({ ...prev, [postId]: res.data }));
      
      // Update comment count on post
      setFeedPosts(posts => posts.map(post => 
        post.id === postId ? { ...post, comments: res.data.length } : post
      ));
    } catch (error) {
      console.error("Gagal submit komen", error);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Login dulu bang buat follow!");

      const res = await apiClient.post(`/users/me/${userId}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update all posts from this user to reflect follow status
      setFeedPosts(posts => posts.map(post => 
        post.user.id === userId 
          ? { ...post, userHasFollowed: res.data.status === 'followed' }
          : post
      ));
    } catch (error) {
      console.error("Gagal nge-follow", error);
    }
  };

  const handleShare = (postId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/social#post-${postId}`);
    alert("Link berhasil disalin!");
  };

  return (
    <div className="min-h-screen bg-zinc-50 pt-8 pb-20">
      <div className="container mx-auto max-w-screen-xl px-4 md:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Community Feed</h1>
          <p className="text-zinc-500 text-lg">Liat tempat ngopi yang lagi *hype* atau dicontek temen lo.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Feed */}
          <div className="flex-1 space-y-6">
            
            {/* Create Post Input */}
            <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
              <CardContent className="p-6">
                <div className="flex gap-4 items-center">
                  <Avatar className="w-12 h-12 border border-zinc-200">
                    <AvatarFallback className="bg-amber-100 text-amber-700 font-bold">Lo</AvatarFallback>
                  </Avatar>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 text-left px-6 py-3.5 rounded-full text-sm font-medium transition-colors"
                  >
                    Lagi ngopi di mana hari ini? Bagi *review* lo...
                  </button>
                </div>
              </CardContent>
            </Card>

            <CreatePostModal 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)} 
              onSuccess={fetchFeed} 
            />

            {/* Posts */}
            {feedPosts.map((post) => (
              <Card key={post.id} className="rounded-[2rem] border-zinc-100 shadow-sm bg-white overflow-hidden">
                <CardContent className="p-0">
                  {/* Post Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-zinc-200">
                          <AvatarFallback className="bg-zinc-800 text-white font-bold">{post.user.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link href={`/profile/${post.user.id}`} className="font-bold text-sm hover:underline hover:text-amber-600">{post.user.name}</Link>
                            <span className="text-xs text-zinc-400">• {post.time}</span>
                          </div>
                          <p className="text-xs font-medium text-amber-600">{post.user.persona}</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleFollow(post.user.id)}
                        variant="ghost" 
                        size="sm" 
                        className={`font-semibold text-xs rounded-full ${post.userHasFollowed ? 'text-blue-600 bg-blue-50 hover:text-blue-700 hover:bg-blue-100' : 'text-zinc-400 hover:text-black'}`}
                      >
                        {post.userHasFollowed ? 'Unfollow' : 'Follow'}
                      </Button>
                    </div>

                    {/* Checked in Cafe */}
                    {post.cafe && (
                      <div className="flex items-center gap-2 text-sm mb-3">
                        <span className="text-zinc-500">{post.type === 'checkin' ? 'Check-in di' : 'Review'}</span>
                        <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold flex items-center gap-1 cursor-pointer">
                          <MapPin className="w-3 h-3" /> {post.cafe.name}
                        </Badge>
                        <div className="flex items-center ml-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < (post.rating || 0) ? 'fill-amber-400 text-amber-400' : 'fill-zinc-200 text-zinc-200'}`} />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Shared Album */}
                    {post.type === 'post' && post.album && (
                      <div className="mb-4">
                        <Link href={`/albums/${post.album.id}`} className="block border border-zinc-200 rounded-2xl p-4 hover:border-amber-500 transition-colors bg-zinc-50 group shadow-sm">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="bg-amber-100 text-amber-600 p-2 rounded-xl">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-folder-heart"><path d="M11 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v1.5"/><path d="M13.9 17.45c-1.2-1.2-1.14-2.8-.2-3.73a2.43 2.43 0 0 1 3.44 0l.36.34.34-.34a2.43 2.43 0 0 1 3.45-.01c.95.95 1 2.53-.2 3.74L17.5 21Z"/></svg>
                            </div>
                            <div>
                              <h4 className="font-bold group-hover:text-amber-600 transition-colors">{post.album.title}</h4>
                              <p className="text-xs text-zinc-500">Lihat Album</p>
                            </div>
                          </div>
                          {post.album.description && (
                            <p className="text-sm text-zinc-600 line-clamp-2 mt-2">{post.album.description}</p>
                          )}
                        </Link>
                      </div>
                    )}

                    <p className="text-zinc-700 leading-relaxed text-sm mb-4">
                      {post.content}
                    </p>
                  </div>

                  {/* Images Grid */}
                  {post.images && post.images.length > 0 && (
                    <div className={`grid gap-1 px-1 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {post.images.map((img: string, idx: number) => (
                        <div key={idx} className={`relative bg-zinc-100 ${post.images.length === 1 ? 'aspect-video' : 'aspect-square'}`}>
                          <img src={img} alt="Post image" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="p-4 flex items-center justify-between border-t border-zinc-50 mt-2">
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 transition-colors group ${post.userHasLiked ? 'text-red-500' : 'text-zinc-500 hover:text-red-500'}`}
                      >
                        <Heart className={`w-5 h-5 ${post.userHasLiked ? 'fill-red-500 text-red-500' : 'group-hover:fill-red-500'}`} />
                        <span className="text-sm font-medium">{post.likes}</span>
                      </button>
                      <button 
                        onClick={() => toggleComments(post.id)}
                        className={`flex items-center gap-2 transition-colors ${expandedComments[post.id] ? 'text-blue-500' : 'text-zinc-500 hover:text-blue-500'}`}
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{post.comments}</span>
                      </button>
                    </div>
                    <button onClick={() => handleShare(post.id)} className="text-zinc-400 hover:text-black transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Comments Section */}
                  {expandedComments[post.id] && (
                    <div className="p-6 pt-2 bg-zinc-50 border-t border-zinc-100">
                      <div className="space-y-4 mb-4">
                        {!postComments[post.id] ? (
                          <div className="text-sm text-zinc-400 text-center py-2">Loading...</div>
                        ) : postComments[post.id].length === 0 ? (
                          <div className="text-sm text-zinc-400 text-center py-2">Jadilah yang pertama ngasih komentar!</div>
                        ) : (
                          postComments[post.id].map((comment: any) => (
                            <div key={comment.id} className="flex gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-zinc-800 text-white text-xs">{comment.user.avatar}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-zinc-100">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-bold text-sm">{comment.user.name}</span>
                                  <span className="text-[10px] text-zinc-400">{comment.created_at}</span>
                                </div>
                                <p className="text-sm text-zinc-600">{comment.content}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      {/* Add Comment */}
                      <div className="flex gap-3 items-center">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-amber-100 text-amber-700 text-xs">Lo</AvatarFallback>
                        </Avatar>
                        <div className="relative flex-1">
                          <Input 
                            placeholder="Tulis balasan..." 
                            className="bg-white border-zinc-200 rounded-full pr-12"
                            value={newComment[post.id] || ""}
                            onChange={(e) => setNewComment(prev => ({...prev, [post.id]: e.target.value}))}
                            onKeyDown={(e) => e.key === 'Enter' && submitComment(post.id)}
                          />
                          <button 
                            onClick={() => submitComment(post.id)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black text-white rounded-full hover:bg-zinc-800 transition-colors"
                          >
                            <Send className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            ))}

          </div>

          {/* Right Column: Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            
            {/* Top 3 Cafes */}
            <Card className="rounded-[2rem] border-none shadow-sm bg-white">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Top 3 Kafe Favorit
                </h3>
                <div className="space-y-4">
                  {myTopCafes.length > 0 ? myTopCafes.map((cafe, i) => (
                    <Link href={`/cafe/${cafe.id}`} key={i} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center text-xs font-bold group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-bold text-sm group-hover:text-amber-600 transition-colors">{cafe.name}</p>
                          <p className="text-xs text-zinc-500 flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {cafe.rating}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )) : (
                    <div className="text-center p-4 bg-zinc-50 rounded-xl">
                      <p className="text-sm text-zinc-500 font-medium">Lo belum ngereview kafe manapun.</p>
                      <Button variant="link" className="text-amber-600 h-auto p-0 mt-1" onClick={() => setIsModalOpen(true)}>Mulai Review Sekarang</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Friends List */}
            {friends.length > 0 && (
              <Card className="rounded-[2rem] border-none shadow-sm bg-white">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" /> Teman Lo
                  </h3>
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                    {friends.map((friend) => (
                      <Link key={friend.id} href={`/profile/${friend.id}`} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border border-zinc-200">
                            {friend.avatar_url ? (
                              <img src={friend.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                              <AvatarFallback className="bg-amber-100 text-amber-700 font-bold text-xs">{friend.username[0]?.toUpperCase()}</AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-bold text-sm group-hover:text-amber-600 transition-colors">{friend.username}</p>
                            <p className="text-[10px] text-zinc-500">{friend.persona || "Coffee Explorer"}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search Users */}
            <Card className="rounded-[2rem] border-none shadow-sm bg-white">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-zinc-500" /> Cari Teman
                </h3>
                <div className="relative mb-4">
                  <Input 
                    placeholder="Ketik username..." 
                    className="bg-zinc-50 border-zinc-200 rounded-xl"
                    value={searchQuery}
                    onChange={handleSearchUser}
                  />
                </div>
                
                {searchQuery && (
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                    {isSearching ? (
                      <p className="text-sm text-zinc-500 text-center">Mencari...</p>
                    ) : searchResults.length === 0 ? (
                      <p className="text-sm text-zinc-500 text-center">Tidak ada user dengan nama "{searchQuery}"</p>
                    ) : (
                      searchResults.map((u: any) => (
                        <div key={u.id} className="flex items-center justify-between group">
                          <Link href={`/profile/${u.id}`} className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              {u.avatar_url ? (
                                <img src={u.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                              ) : (
                                <AvatarFallback className="bg-amber-100 text-amber-700 text-xs font-bold">{u.username?.[0]?.toUpperCase()}</AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="font-bold text-sm group-hover:text-amber-600 transition-colors">{u.username}</p>
                              <p className="text-[10px] text-zinc-500">{u.persona}</p>
                            </div>
                          </Link>
                          <Button 
                            onClick={() => handleFollow(u.id)}
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                          >
                            Follow
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Find Friends */}
            <Card className="rounded-[2rem] border-none shadow-sm bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
              <CardContent className="p-6 text-center">
                <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Temukan Teman Ngopi</h3>
                <p className="text-purple-100 text-sm mb-6">Hubungkan kontak atau Instagram lo buat liat rekomendasi kafe dari temen-temen lo.</p>
                <Button className="w-full bg-white text-purple-700 hover:bg-zinc-100 rounded-full font-bold">
                  Connect
                </Button>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </div>
  );
}
