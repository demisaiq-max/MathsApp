import { supabase } from '../lib/supabase';

export interface Announcement {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}

export interface QAPost {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  title: string;
  content: string;
  postType: 'question' | 'answer';
  parentId?: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  answers?: QAPost[];
}

export interface PostComment {
  id: string;
  postId: string;
  postType: 'announcement' | 'qa_post';
  authorId: string;
  authorName: string;
  authorInitials: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const boardApiService = {
  // Create a new announcement (admin only)
  createAnnouncement: async (announcement: {
    title: string;
    content: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    gradeLevel?: number;
    gradeLevel?: number;
  }): Promise<Announcement> => {
    const user = (await supabase.auth.getUser()).data.user;
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user?.id)
      .single();
    
    const authorName = profile?.full_name || 'Administrator';
    const authorInitials = authorName.split(' ').map(n => n[0]).join('').toUpperCase();
    
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        author_id: user?.id,
        author_name: authorName,
        author_initials: authorInitials,
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        grade_level: announcement.gradeLevel
        grade_level: announcement.gradeLevel
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      authorId: data.author_id,
      authorName: data.author_name,
      authorInitials: data.author_initials,
      title: data.title,
      content: data.content,
      priority: data.priority,
      gradeLevel: data.grade_level,
      gradeLevel: data.grade_level,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      likesCount: 0,
      commentsCount: 0,
      isLiked: false
    };
  },

  // Get all announcements with likes and comments count
  getAnnouncements: async (gradeLevel?: number): Promise<Announcement[]> => {
    let query = supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Filter by grade level if specified
    if (gradeLevel) {
      query = query.or(`grade_level.is.null,grade_level.eq.${gradeLevel}`);
    }
    
    const { data, error } = await query;
    
    // Filter by grade level if specified
    if (gradeLevel) {
      query = query.or(`grade_level.is.null,grade_level.eq.${gradeLevel}`);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Get all likes for announcements
    const { data: allLikes } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('post_type', 'announcement');
    
    // Get all comments for announcements
    const { data: allComments } = await supabase
      .from('post_comments')
      .select('post_id')
      .eq('post_type', 'announcement');
    
    if (gradeLevel) {
      query = query.or(`grade_level.is.null,grade_level.eq.${gradeLevel}`);
    }
    
    // Count likes and comments by post_id
    const likeCounts = (allLikes || []).reduce((acc, like) => {
      acc[like.post_id] = (acc[like.post_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const commentCounts = (allComments || []).reduce((acc, comment) => {
      acc[comment.post_id] = (acc[comment.post_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Get current user's likes
    const { data: userLikes } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .eq('post_type', 'announcement');
    
    const likedPostIds = new Set(userLikes?.map(like => like.post_id) || []);
    
    return data.map(announcement => ({
      id: announcement.id,
      authorId: announcement.author_id,
      authorName: announcement.author_name,
      authorInitials: announcement.author_initials,
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      createdAt: announcement.created_at,
      updatedAt: announcement.updated_at,
      likesCount: likeCounts[announcement.id] || 0,
      commentsCount: commentCounts[announcement.id] || 0,
      isLiked: likedPostIds.has(announcement.id)
    }));
  },

  // Get all Q&A posts with answers
  getQAPosts: async (): Promise<QAPost[]> => {
    const { data, error } = await supabase
      .from('qa_posts')
      .select(`
        *,
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Get all likes for qa_posts
    const { data: allLikes } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('post_type', 'qa_post');
    
    // Get all comments for qa_posts
    const { data: allComments } = await supabase
      .from('post_comments')
      .select('post_id')
      .eq('post_type', 'qa_post');
    
    // Count likes and comments by post_id
    const likeCounts = (allLikes || []).reduce((acc, like) => {
      acc[like.post_id] = (acc[like.post_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const commentCounts = (allComments || []).reduce((acc, comment) => {
      acc[comment.post_id] = (acc[comment.post_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Get current user's likes
    const { data: userLikes } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .eq('post_type', 'qa_post');
    
    const likedPostIds = new Set(userLikes?.map(like => like.post_id) || []);
    
    return data.map(post => ({
      id: post.id,
      authorId: post.author_id,
      authorName: post.author_name,
      authorInitials: post.author_initials,
      title: post.title,
      content: post.content,
      postType: post.post_type,
      gradeLevel: announcement.grade_level,
      parentId: post.parent_id,
      isResolved: post.is_resolved,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      likesCount: likeCounts[post.id] || 0,
      commentsCount: commentCounts[post.id] || 0,
      isLiked: likedPostIds.has(post.id),
      answers: post.answers?.map((answer: any) => ({
        id: answer.id,
        authorId: answer.author_id,
        authorName: answer.author_name,
        authorInitials: answer.author_initials,
        title: answer.title,
        content: answer.content,
        postType: answer.post_type,
        parentId: answer.parent_id,
        isResolved: answer.is_resolved,
        createdAt: answer.created_at,
        updatedAt: answer.updated_at,
        likesCount: 0,
        commentsCount: 0,
        isLiked: false
      })) || []
    }));
  },

  // Create a new Q&A post
  createQAPost: async (post: {
    title: string;
    content: string;
    postType: 'question' | 'answer';
    parentId?: string;
  }): Promise<QAPost> => {
    const user = (await supabase.auth.getUser()).data.user;
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user?.id)
      .single();
    
    const authorName = profile?.full_name || 'Anonymous';
    const authorInitials = authorName.split(' ').map(n => n[0]).join('').toUpperCase();
  getQAPosts: async (gradeLevel?: number): Promise<QAPost[]> => {
    let query = supabase
      .from('qa_posts')
      .select(`
        *,
        answers:qa_posts!parent_id(*)
      `)
      .is('parent_id', null)
      .order('created_at', { ascending: false });
    
    // Filter by grade level if specified (for students)
    if (gradeLevel) {
      query = query.or(`grade_level.is.null,grade_level.eq.${gradeLevel}`);
    }
    
      .insert({
        author_id: user?.id,
        author_name: authorName,
        author_initials: authorInitials,
        title: post.title,
        content: post.content,
        post_type: post.postType,
        parent_id: post.parentId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      authorId: data.author_id,
      authorName: data.author_name,
      authorInitials: data.author_initials,
      title: data.title,
      content: data.content,
      postType: data.post_type,
      parentId: data.parent_id,
      isResolved: data.is_resolved,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      likesCount: 0,
    const { data, error } = await query;
  toggleLike: async (postId: string, postType: 'announcement' | 'qa_post'): Promise<boolean> => {
    const user = (await supabase.auth.getUser()).data.user;
    
    // Check if already liked
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('user_id', user?.id)
      .eq('post_id', postId)
      .eq('post_type', postType)
      .maybeSingle();
    
    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('id', existingLike.id);
      
      if (error) throw error;
      return false;
    } else {
      // Like
      const { error } = await supabase
        .from('post_likes')
        .insert({
          user_id: user?.id,
          post_id: postId,
          post_type: postType
        });
      
      if (error) throw error;
      return true;
    }
  },

      gradeLevel: post.grade_level,
  // Get comments for a post
  getPostComments: async (postId: string, postType: 'announcement' | 'qa_post'): Promise<PostComment[]> => {
    const { data, error } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .eq('post_type', postType)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    return data.map(comment => ({
      id: comment.id,
      postId: comment.post_id,
      postType: comment.post_type,
        gradeLevel: answer.grade_level,
      authorId: comment.author_id,
      authorName: comment.author_name,
      authorInitials: comment.author_initials,
      content: comment.content,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at
    }));
  },

  // Add comment to a post
  addComment: async (postId: string, postType: 'announcement' | 'qa_post', content: string): Promise<PostComment> => {
    const user = (await supabase.auth.getUser()).data.user;
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
    gradeLevel?: number;
      .eq('id', user?.id)
      .single();
    
    const authorName = profile?.full_name || 'Anonymous';
    const authorInitials = authorName.split(' ').map(n => n[0]).join('').toUpperCase();
    
    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        post_type: postType,
        author_id: user?.id,
        author_name: authorName,
        author_initials: authorInitials,
        content: content
        parent_id: post.parentId,
        grade_level: post.gradeLevel
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      postId: data.post_id,
      postType: data.post_type,
      authorId: data.author_id,
      authorName: data.author_name,
      authorInitials: data.author_initials,
      content: data.content,
      gradeLevel: data.grade_level,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
};