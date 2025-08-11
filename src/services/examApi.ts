@@ .. @@
   };
 };
 
+// Upload answer sheet file
+export const uploadAnswerSheet = async (
+  examId: string,
+  file: File
+): Promise<void> => {
+  const user = (await supabase.auth.getUser()).data.user;
+  if (!user) throw new Error('User not authenticated');
+
+  // Convert file to base64 for storage
+  const fileBuffer = await file.arrayBuffer();
+  const fileData = new Uint8Array(fileBuffer);
+
+  const { error } = await supabase
+    .from('answer_sheet_uploads')
+    .insert({
+      student_id: user.id,
+      exam_id: examId,
+      file_name: file.name,
+      file_size: file.size,
+      file_type: file.type,
+      file_data: fileData
+    });
+
+  if (error) throw error;
+};
+
+// Get answer sheet uploads for admin
+export const getAnswerSheetUploads = async (): Promise<any[]> => {
+  const { data, error } = await supabase
+    .from('answer_sheet_uploads')
+    .select(`
+      *,
+      student:profiles!student_id(full_name),
+      exam:exams(title, subject)
+    `)
+    .order('upload_date', { ascending: false });
+
+  if (error) throw error;
+  return data || [];
+};
+
+// Grade answer sheet (admin only)
+export const gradeAnswerSheet = async (
+  uploadId: string,
+  grade: number,
+  feedback?: string
+): Promise<void> => {
+  const user = (await supabase.auth.getUser()).data.user;
+  if (!user) throw new Error('User not authenticated');
+
+  const { error } = await supabase
+    .from('answer_sheet_uploads')
+    .update({
+      admin_grade: grade,
+      admin_feedback: feedback,
+      graded_by: user.id,
+      graded_at: new Date().toISOString(),
+      status: 'graded'
+    })
+    .eq('id', uploadId);
+
+  if (error) throw error;
+};
+
 export const examApiService = {
   getAvailableExams,
   getExamWithQuestions,
   submitExam,
   hasSubmittedExam,
-  getStudentSubmissions
+  getStudentSubmissions,
+  uploadAnswerSheet,
+  getAnswerSheetUploads,
+  gradeAnswerSheet
 };