import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import {
  LayoutDashboard, FileText, ShoppingCart, BarChart2,
  Search, Eye, Download, Plus, Trash2, BookOpen, LogOut, ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  useGetAdminStats, useListDocuments, useListAmazonProducts, useListMockTests,
  useDeleteDocument, useDeleteAmazonProduct, useDeleteMockTest,
  useCreateDocument, useCreateAmazonProduct, useCreateMockTest,
  getGetAdminStatsQueryKey, getListDocumentsQueryKey, getListAmazonProductsQueryKey, getListMockTestsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

type AdminTab = "overview" | "documents" | "materials" | "mock-tests" | "searches";

const NAV = [
  { id: "overview" as AdminTab, label: "Overview", icon: LayoutDashboard },
  { id: "documents" as AdminTab, label: "Documents", icon: FileText },
  { id: "materials" as AdminTab, label: "Materials", icon: ShoppingCart },
  { id: "mock-tests" as AdminTab, label: "Mock Tests", icon: ClipboardList },
  { id: "searches" as AdminTab, label: "Searches", icon: Search },
];

const CATEGORY_LABELS: Record<string, string> = {
  "notes": "Notes",
  "investigatory-projects": "Investigatory Projects",
  "question-papers": "Question Papers",
  "free-book-pdfs": "Free Book PDFs",
  "practical-files-class-12": "Practical Files Class 12",
  "materials": "Materials",
};

export function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const { toast } = useToast();
  const qc = useQueryClient();
  const ADMIN_EMAIL = "kartik1911k@gmail.com";

  // Guard: check admin using Supabase
  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session || session.user.email !== ADMIN_EMAIL) {
        setLocation("/login");
      }
    };

    checkAdmin();

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session || session.user.email !== ADMIN_EMAIL) {
        setLocation("/login");
      }
    });

    return () => data?.subscription?.unsubscribe?.();
  }, [setLocation]);

  const { data: stats } = useGetAdminStats({ query: { queryKey: getGetAdminStatsQueryKey() } });
  const { data: docs } = useListDocuments({}, { query: { queryKey: getListDocumentsQueryKey({}) } });
  const { data: products } = useListAmazonProducts({ query: { queryKey: getListAmazonProductsQueryKey() } });
  const { data: mockTests } = useListMockTests({ query: { queryKey: getListMockTestsQueryKey() } });

  const deleteDoc = useDeleteDocument();
  const deleteProduct = useDeleteAmazonProduct();
  const deleteMockTest = useDeleteMockTest();
  const createDoc = useCreateDocument();
  const createProduct = useCreateAmazonProduct();
  const createMockTest = useCreateMockTest();

  // Add Document form state
  const [docForm, setDocForm] = useState({ title: "", description: "", category: "notes", price: "", thumbnailUrl: "" });
  const [amazonForm, setAmazonForm] = useState({ title: "", description: "", affiliateUrl: "", imageUrl: "", price: "" });
  const [mockTestForm, setMockTestForm] = useState({ title: "", description: "", subject: "", section: "", duration: "30", correctMarks: "4", incorrectMarks: "-1", unattemptedMarks: "0" });
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
  const [questionImages, setQuestionImages] = useState<Record<number, string>>({});
  
  // File upload state
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docWordFile, setDocWordFile] = useState<File | null>(null);
  const [docThumbnail, setDocThumbnail] = useState<File | null>(null);
  const [amazonImage, setAmazonImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDeleteDoc = (id: number) => {
    deleteDoc.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Document deleted" });
        qc.invalidateQueries({ queryKey: getListDocumentsQueryKey({}) });
        qc.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
      },
    });
  };

  const handleDeleteProduct = (id: number) => {
    deleteProduct.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Product deleted" });
        qc.invalidateQueries({ queryKey: getListAmazonProductsQueryKey() });
      },
    });
  };

  const uploadFile = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    setUploadProgress(0);

    console.log(`Uploading file: ${file.name} to ${folder}/${fileName}`);

    const { error: uploadError, data } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    console.log('Upload successful:', data);

    const { data: publicUrlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    console.log('Public URL:', publicUrlData.publicUrl);

    setUploadProgress(100);

    return publicUrlData.publicUrl;
  };

  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadProgress(0);

    console.log('Starting document upload with form data:', docForm);
    console.log('Files to upload:', { docFile: docFile?.name, docWordFile: docWordFile?.name, docThumbnail: docThumbnail?.name });

    try {
      let fileUrl = "";
      let wordFileUrl = "";
      let thumbnailUrl = "";

      // Upload document file if provided
      if (docFile) {
        setUploadProgress(20);
        console.log('Uploading document file...');
        fileUrl = await uploadFile(docFile, 'documents');
        console.log('Document file uploaded:', fileUrl);
        setUploadProgress(40);
      }

      // Upload Word file if provided
      if (docWordFile) {
        setUploadProgress(50);
        console.log('Uploading Word file...');
        wordFileUrl = await uploadFile(docWordFile, 'word-files');
        console.log('Word file uploaded:', wordFileUrl);
        setUploadProgress(60);
      }

      // Upload thumbnail if provided
      if (docThumbnail) {
        setUploadProgress(80);
        console.log('Uploading thumbnail...');
        thumbnailUrl = await uploadFile(docThumbnail, 'thumbnails');
        console.log('Thumbnail uploaded:', thumbnailUrl);
      }

      setUploadProgress(90);

      const docData = {
        title: docForm.title,
        description: docForm.description,
        category: docForm.category,
        fileType: "pdf",
        isFree: !wordFileUrl,
        price: wordFileUrl ? (parseInt(docForm.price, 10) || null) : null,
        fileUrl: fileUrl || null,
        wordFileUrl: wordFileUrl || null,
        thumbnailUrl: thumbnailUrl || null,
      };

      console.log('Creating document with data:', docData);

      createDoc.mutate({
        data: docData
      }, {
        onSuccess: () => {
          setUploadProgress(100);
          toast({ title: "Document added!" });
          setDocForm({ title: "", description: "", category: "notes", price: "", thumbnailUrl: "" });
          setDocFile(null);
          setDocWordFile(null);
          setDocThumbnail(null);
          qc.invalidateQueries({ queryKey: getListDocumentsQueryKey({}) });
          qc.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        },
        onError: (error) => {
          console.error('Error adding document:', error);
          toast({ title: "Error adding document", description: error.message, variant: "destructive" });
        },
      });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadProgress(0);

    try {
      let imageUrl = amazonForm.imageUrl;

      // Upload image if provided
      if (amazonImage) {
        setUploadProgress(50);
        imageUrl = await uploadFile(amazonImage, 'amazon-products');
      }

      setUploadProgress(90);

      createProduct.mutate({
        data: {
          title: amazonForm.title,
          description: amazonForm.description,
          affiliateUrl: amazonForm.affiliateUrl,
          imageUrl: imageUrl || null,
          price: amazonForm.price || null,
        }
      }, {
        onSuccess: () => {
          setUploadProgress(100);
          toast({ title: "Product added!" });
          setAmazonForm({ title: "", description: "", affiliateUrl: "", imageUrl: "", price: "" });
          setAmazonImage(null);
          qc.invalidateQueries({ queryKey: getListAmazonProductsQueryKey() });
        },
        onError: (error) => {
          toast({ title: "Error adding product", description: error.message, variant: "destructive" });
        },
      });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDeleteMockTest = (id: number) => {
    deleteMockTest.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Mock test deleted" });
        qc.invalidateQueries({ queryKey: getListMockTestsQueryKey() });
      },
    });
  };

  const handleAddMockTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      if (parsedQuestions.length === 0) {
        if (!jsonFile) {
          toast({ title: "Please select a JSON file", variant: "destructive" });
          setUploading(false);
          return;
        }
        const jsonText = await jsonFile.text();
        const jsonData = JSON.parse(jsonText);
        let questionsArray: any[];
        
        if (Array.isArray(jsonData)) {
          questionsArray = jsonData;
        } else if (jsonData.questions && Array.isArray(jsonData.questions)) {
          questionsArray = jsonData.questions;
        } else {
          toast({ title: "Invalid JSON format", variant: "destructive" });
          setUploading(false);
          return;
        }
        
        const questions = questionsArray.map((q: any, index: number) => {
          let optionA = "", optionB = "", optionC = "", optionD = "";
          
          if (q.options && Array.isArray(q.options)) {
            q.options.forEach((opt: any) => {
              const optId = String(opt.optionId || opt.id || "").toUpperCase();
              const optText = opt.text || opt.content || opt.value || "";
              if (optId === "A") optionA = optText;
              if (optId === "B") optionB = optText;
              if (optId === "C") optionC = optText;
              if (optId === "D") optionD = optText;
            });
          } else {
            optionA = q.optionA || q.A || q.a || "";
            optionB = q.optionB || q.B || q.b || "";
            optionC = q.optionC || q.C || q.c || "";
            optionD = q.optionD || q.D || q.d || "";
          }

          const correctAnswer = String(q.correctAnswer || q.answer || q.correct || q.correct_option || "").toUpperCase();

          return {
            question: q.question || q.questionText || q.q || `Question ${index + 1}`,
            questionImage: q.questionImage || q.image || null,
            optionA,
            optionB,
            optionC,
            optionD,
            correctAnswer,
            solution: q.solution || q.explanation || null,
          };
        });

        submitMockTest(questions);
      } else {
        const questions = parsedQuestions.map((q, index: number) => {
          let optionA = "", optionB = "", optionC = "", optionD = "";
          
          if (q.options && Array.isArray(q.options)) {
            q.options.forEach((opt: any) => {
              const optId = String(opt.optionId || opt.id || "").toUpperCase();
              const optText = opt.text || opt.content || opt.value || "";
              if (optId === "A") optionA = optText;
              if (optId === "B") optionB = optText;
              if (optId === "C") optionC = optText;
              if (optId === "D") optionD = optText;
            });
          } else {
            optionA = q.optionA || q.A || q.a || "";
            optionB = q.optionB || q.B || q.b || "";
            optionC = q.optionC || q.C || q.c || "";
            optionD = q.optionD || q.D || q.d || "";
          }

          const correctAnswer = String(q.correctAnswer || q.answer || q.correct || q.correct_option || "").toUpperCase();

          return {
            question: q.question,
            questionImage: questionImages[index] || q.imageUrl || null,
            optionA,
            optionB,
            optionC,
            optionD,
            correctAnswer,
            solution: q.solution || q.explanation || null,
          };
        });

        submitMockTest(questions);
      }
    } catch (error: any) {
      toast({ title: "Error adding mock test", description: error.message, variant: "destructive" });
      setUploading(false);
    }
  };

  const submitMockTest = (questions: any[]) => {
    const payload = {
      title: mockTestForm.title,
      description: mockTestForm.description,
      subject: mockTestForm.subject,
      section: mockTestForm.section || "General",
      duration: parseInt(mockTestForm.duration, 10),
      correctMarks: parseInt(mockTestForm.correctMarks, 10) || 4,
      incorrectMarks: parseInt(mockTestForm.incorrectMarks, 10) || -1,
      unattemptedMarks: parseInt(mockTestForm.unattemptedMarks, 10) || 0,
      questions,
    };
    console.log("Submitting mock test payload:", payload);
    console.log("Questions count:", questions.length);
    console.log("First question:", questions[0]);
    
    createMockTest.mutate({
      data: payload
    }, {
      onSuccess: () => {
        toast({ title: "Mock test added!" });
        setMockTestForm({ title: "", description: "", subject: "", section: "", duration: "30", correctMarks: "4", incorrectMarks: "-1", unattemptedMarks: "0" });
        setJsonFile(null);
        setParsedQuestions([]);
        setQuestionImages({});
        qc.invalidateQueries({ queryKey: getListMockTestsQueryKey() });
      },
      onError: (error: any) => {
        console.error("Mock test error:", error);
        toast({ title: "Error adding mock test", description: error.message || JSON.stringify(error), variant: "destructive" });
      },
      onSettled: () => {
        setUploading(false);
      }
    });
  };

  const handleParseJsonFile = async (file: File) => {
    setJsonFile(file);
    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      let questionsArray: any[];
      
      if (Array.isArray(jsonData)) {
        questionsArray = jsonData;
      } else if (jsonData.questions && Array.isArray(jsonData.questions)) {
        questionsArray = jsonData.questions;
      } else {
        toast({ title: "Invalid JSON", description: "JSON must be an array of questions or contain a 'questions' array", variant: "destructive" });
        setParsedQuestions([]);
        return;
      }

      const parsed = questionsArray.map((q: any, index: number) => ({
        question: q.question || q.questionText || q.q || `Question ${index + 1}`,
        hasImage: !!q.questionImage || !!q.image,
        imageUrl: q.questionImage || q.image || null,
        options: q.options || [],
        correctAnswer: q.correctAnswer || q.answer || q.correct || "",
      }));

      setParsedQuestions(parsed);
      toast({ title: `Parsed ${parsed.length} questions` });
    } catch (error: any) {
      toast({ title: "Error parsing JSON", description: error.message, variant: "destructive" });
      setParsedQuestions([]);
    }
  };

  const handleQuestionImageUpload = async (index: number, file: File) => {
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setQuestionImages(prev => ({ ...prev, [index]: base64 }));
      setParsedQuestions(prev => prev.map((q, i) => i === index ? { ...q, hasImage: true, imageUrl: base64 } : q));
    } catch (error: any) {
      toast({ title: "Error uploading image", description: error.message, variant: "destructive" });
    }
  };

  const handleRemoveQuestionImage = (index: number) => {
    setQuestionImages(prev => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    setParsedQuestions(prev => prev.map((q, i) => i === index ? { ...q, hasImage: false, imageUrl: null } : q));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setLocation("/");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="flex items-center gap-2 px-5 h-14 border-b border-sidebar-border shrink-0">
          <BookOpen className="h-5 w-5 text-sidebar-primary" />
          <span className="font-serif font-bold text-base">OkSchool Admin</span>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === id ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
              data-testid={`sidebar-${id}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-2 shrink-0">
          <Link href="/">
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors rounded-lg">
              <Eye className="h-4 w-4" /> View Site
            </button>
          </Link>
          <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors rounded-lg" data-testid="button-signout">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">

          {/* Overview */}
          {activeTab === "overview" && (
            <div>
              <h1 className="font-serif text-2xl font-bold mb-6">Dashboard</h1>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Views", value: stats?.totalViews ?? 0, icon: Eye },
                  { label: "PDF Downloads", value: stats?.pdfDownloads ?? 0, icon: Download },
                  { label: "Word Downloads", value: stats?.wordDownloads ?? 0, icon: Download },
                  { label: "Documents", value: stats?.totalDocuments ?? 0, icon: FileText },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-card border border-card-border rounded-xl p-5">
                    <Icon className="h-5 w-5 text-muted-foreground mb-2" />
                    <div className="text-3xl font-bold text-foreground">{value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-card border border-card-border rounded-xl p-6 mb-6">
                <h2 className="font-serif text-lg font-semibold mb-4">Recent Documents</h2>
                {stats?.recentDocuments?.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No documents yet.</p>
                ) : (
                  <div className="space-y-2">
                    {stats?.recentDocuments?.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium text-sm">{doc.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">{doc.category.replace(/-/g, " ")} &bull; {doc.viewCount}v &bull; {doc.pdfDownloads} PDF</p>
                        </div>
                        <Badge className={doc.isFree ? "bg-green-100 text-green-700" : "bg-primary text-primary-foreground"}>
                          {doc.isFree ? "FREE" : `₹${doc.price}`}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-card border border-card-border rounded-xl p-6">
                <h2 className="font-serif text-lg font-semibold mb-4">Site Sections</h2>
                <div className="flex flex-wrap gap-2">
                  {stats?.sectionCounts?.map(({ category, count }) => (
                    <span key={category} className="bg-muted text-foreground text-xs px-3 py-1.5 rounded-full font-medium">
                      {CATEGORY_LABELS[category] ?? category} &bull; {count} {category === "materials" ? "items" : "docs"}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Documents */}
          {activeTab === "documents" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-serif text-2xl font-bold">Documents</h1>
              </div>

              {/* Add document form */}
              <div className="bg-card border border-card-border rounded-xl p-6 mb-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2"><Plus className="h-4 w-4" /> Add Document</h2>
                <form onSubmit={handleAddDoc} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="doc-title">Title *</Label>
                    <Input id="doc-title" placeholder="Document name" value={docForm.title} onChange={(e) => setDocForm((f) => ({ ...f, title: e.target.value }))} className="mt-1" data-testid="input-doc-title" required />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="doc-desc">Description</Label>
                    <Input id="doc-desc" placeholder="Brief description" value={docForm.description} onChange={(e) => setDocForm((f) => ({ ...f, description: e.target.value }))} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="doc-cat">Category</Label>
                    <select id="doc-cat" value={docForm.category} onChange={(e) => setDocForm((f) => ({ ...f, category: e.target.value }))} className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background" data-testid="select-doc-category">
                      {Object.entries(CATEGORY_LABELS).filter(([k]) => k !== "materials").map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="doc-file">Upload PDF File *</Label>
                    <Input 
                      id="doc-file" 
                      type="file" 
                      required
                      onChange={(e) => setDocFile(e.target.files?.[0] || null)} 
                      className="mt-1" 
                      accept=".pdf"
                    />
                  </div>
                  <div>
                    <Label htmlFor="doc-word-file">Upload Word File (Optional)</Label>
                    <Input 
                      id="doc-word-file" 
                      type="file" 
                      onChange={(e) => {
                        setDocWordFile(e.target.files?.[0] || null);
                        if (e.target.files?.[0]) {
                          setDocForm((f) => ({ ...f, price: f.price || "" }));
                        }
                      }} 
                      className="mt-1" 
                      accept=".doc,.docx"
                    />
                    {docWordFile && (
                      <Input 
                        placeholder="Word file price (₹)" 
                        value={docForm.price} 
                        onChange={(e) => setDocForm((f) => ({ ...f, price: e.target.value }))} 
                        className="mt-2 w-full" 
                        type="number" 
                        data-testid="input-doc-price"
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="doc-thumb-file">Upload Thumbnail</Label>
                    <Input 
                      id="doc-thumb-file" 
                      type="file" 
                      onChange={(e) => setDocThumbnail(e.target.files?.[0] || null)} 
                      className="mt-1" 
                      accept="image/*"
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end">
                    <Button type="submit" disabled={createDoc.isPending || uploading} data-testid="button-add-doc">
                      {uploading ? "Uploading..." : createDoc.isPending ? "Adding..." : "Add Document"}
                    </Button>
                  </div>
                  {uploading && (
                    <div className="sm:col-span-2">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">Uploading... {uploadProgress}%</p>
                    </div>
                  )}
                </form>
              </div>

              {/* Documents table */}
              <div className="bg-card border border-card-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-3">Title</th>
                      <th className="text-left px-4 py-3 hidden sm:table-cell">Category</th>
                      <th className="text-left px-4 py-3">Word Price</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(docs ?? []).map((doc) => (
                      <tr key={doc.id} className="hover:bg-muted/40 transition-colors" data-testid={`row-doc-${doc.id}`}>
                        <td className="px-4 py-3 font-medium text-foreground line-clamp-1">{doc.title}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell capitalize">{doc.category.replace(/-/g, " ")}</td>
                        <td className="px-4 py-3">
                          <Badge className={!doc.wordFileUrl ? "bg-green-100 text-green-700 text-xs" : "bg-primary/10 text-primary text-xs"}>
                            {!doc.wordFileUrl ? "PDF Only" : `₹${doc.price ?? 0}`}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDeleteDoc(doc.id)} className="text-muted-foreground hover:text-destructive transition-colors" data-testid={`button-delete-doc-${doc.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(docs ?? []).length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No documents yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Materials */}
          {activeTab === "materials" && (
            <div>
              <h1 className="font-serif text-2xl font-bold mb-6">Amazon Products</h1>

              {/* Add product form */}
              <div className="bg-card border border-card-border rounded-xl p-6 mb-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2"><Plus className="h-4 w-4" /> Add Amazon Product</h2>
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="az-title">Title *</Label>
                    <Input id="az-title" placeholder="Product name" value={amazonForm.title} onChange={(e) => setAmazonForm((f) => ({ ...f, title: e.target.value }))} className="mt-1" required data-testid="input-amazon-title" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="az-desc">Description</Label>
                    <Input id="az-desc" placeholder="Brief description" value={amazonForm.description} onChange={(e) => setAmazonForm((f) => ({ ...f, description: e.target.value }))} className="mt-1" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="az-url">Amazon Affiliate URL *</Label>
                    <Input id="az-url" placeholder="https://amazon.in/..." value={amazonForm.affiliateUrl} onChange={(e) => setAmazonForm((f) => ({ ...f, affiliateUrl: e.target.value }))} className="mt-1" required data-testid="input-amazon-url" />
                  </div>
                  <div>
                    <Label htmlFor="az-img-file">Upload Image</Label>
                    <Input 
                      id="az-img-file" 
                      type="file" 
                      onChange={(e) => setAmazonImage(e.target.files?.[0] || null)} 
                      className="mt-1" 
                      accept="image/*"
                    />
                  </div>
                  <div>
                    <Label htmlFor="az-price">Price</Label>
                    <Input id="az-price" placeholder="₹499" value={amazonForm.price} onChange={(e) => setAmazonForm((f) => ({ ...f, price: e.target.value }))} className="mt-1" data-testid="input-amazon-price" />
                  </div>
                  <div className="sm:col-span-2 flex justify-end">
                    <Button type="submit" disabled={createProduct.isPending || uploading} data-testid="button-add-product">
                      {uploading ? "Uploading..." : createProduct.isPending ? "Adding..." : "Add Product"}
                    </Button>
                  </div>
                  {uploading && (
                    <div className="sm:col-span-2">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">Uploading... {uploadProgress}%</p>
                    </div>
                  )}
                </form>
              </div>

              {/* Products table */}
              <div className="bg-card border border-card-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-3">Title</th>
                      <th className="text-left px-4 py-3 hidden md:table-cell">Price</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(products ?? []).map((p) => (
                      <tr key={p.id} className="hover:bg-muted/40 transition-colors" data-testid={`row-amazon-${p.id}`}>
                        <td className="px-4 py-3 font-medium text-foreground">{p.title}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.price ?? "—"}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDeleteProduct(p.id)} className="text-muted-foreground hover:text-destructive transition-colors" data-testid={`button-delete-amazon-${p.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(products ?? []).length === 0 && (
                      <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No products yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mock Tests */}
          {activeTab === "mock-tests" && (
            <div>
              <h1 className="font-serif text-2xl font-bold mb-6">Mock Tests</h1>

              {/* Add mock test form */}
              <div className="bg-card border border-card-border rounded-xl p-6 mb-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2"><Plus className="h-4 w-4" /> Add Mock Test</h2>
                <form onSubmit={handleAddMockTest} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="mt-title">Title *</Label>
                    <Input id="mt-title" placeholder="Test name" value={mockTestForm.title} onChange={(e) => setMockTestForm((f) => ({ ...f, title: e.target.value }))} className="mt-1" required />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="mt-desc">Description</Label>
                    <Input id="mt-desc" placeholder="Brief description" value={mockTestForm.description} onChange={(e) => setMockTestForm((f) => ({ ...f, description: e.target.value }))} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="mt-subject">Subject *</Label>
                    <Input id="mt-subject" placeholder="Physics, Chemistry, etc." value={mockTestForm.subject} onChange={(e) => setMockTestForm((f) => ({ ...f, subject: e.target.value }))} className="mt-1" required />
                  </div>
                  <div>
                    <Label htmlFor="mt-section">Section / Exam *</Label>
                    <Input id="mt-section" list="section-list" placeholder="e.g. JEE, NEET, CBSE" value={mockTestForm.section} onChange={(e) => setMockTestForm((f) => ({ ...f, section: e.target.value }))} className="mt-1" required />
                    <datalist id="section-list">
                      {[...new Set((mockTests ?? []).map(t => t.section))].map(section => (
                        <option key={section} value={section} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <Label htmlFor="mt-duration">Duration (minutes) *</Label>
                    <Input id="mt-duration" type="number" placeholder="30" value={mockTestForm.duration} onChange={(e) => setMockTestForm((f) => ({ ...f, duration: e.target.value }))} className="mt-1" required />
                  </div>
                  <div>
                    <Label htmlFor="mt-correct">Correct Answer Marks *</Label>
                    <Input id="mt-correct" type="number" placeholder="4" value={mockTestForm.correctMarks} onChange={(e) => setMockTestForm((f) => ({ ...f, correctMarks: e.target.value }))} className="mt-1" required />
                  </div>
                  <div>
                    <Label htmlFor="mt-incorrect">Incorrect Answer Marks *</Label>
                    <Input id="mt-incorrect" type="number" placeholder="-1" value={mockTestForm.incorrectMarks} onChange={(e) => setMockTestForm((f) => ({ ...f, incorrectMarks: e.target.value }))} className="mt-1" required />
                  </div>
                  <div>
                    <Label htmlFor="mt-unattempted">Unattempted Marks *</Label>
                    <Input id="mt-unattempted" type="number" placeholder="0" value={mockTestForm.unattemptedMarks} onChange={(e) => setMockTestForm((f) => ({ ...f, unattemptedMarks: e.target.value }))} className="mt-1" required />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="mt-json">Questions JSON File *</Label>
                    <Input 
                      id="mt-json" 
                      type="file" 
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) {
                          handleParseJsonFile(file);
                        } else {
                          setJsonFile(null);
                          setParsedQuestions([]);
                        }
                      }} 
                      className="mt-1" 
                      accept=".json"
                      required={parsedQuestions.length === 0}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a JSON file with questions. Supports images via "questionImage" field. Format: array of objects with question, options, correctAnswer, and solution fields.
                    </p>
                    <details className="mt-3">
                      <summary className="text-xs text-primary cursor-pointer hover:underline">View JSON format example</summary>
                      <pre className="mt-2 bg-muted rounded-lg p-3 text-xs overflow-x-auto text-muted-foreground">
{`[
  {
    "question": "How many blocks of wood planks are obtained by crafting a single log?",
    "questionImage": "https://example.com/images/crafting-table.png",
    "options": [
      { "optionId": "A", "text": "2" },
      { "optionId": "B", "text": "4" },
      { "optionId": "C", "text": "6" },
      { "optionId": "D", "text": "8" }
    ],
    "correctAnswer": "B",
    "solution": "One log crafts into 4 wooden planks."
  },
  {
    "question": "Identify the structure shown below:",
    "questionImage": "https://example.com/images/cell-diagram.jpg",
    "options": [
      { "optionId": "A", "text": "Mitochondria" },
      { "optionId": "B", "text": "Nucleus" },
      { "optionId": "C", "text": "Ribosome" },
      { "optionId": "D", "text": "Golgi Apparatus" }
    ],
    "correctAnswer": "B",
    "solution": "The image shows the nucleus with its double membrane."
  }
]`}
                      </pre>
                    </details>

                    {parsedQuestions.length > 0 && (
                      <div className="mt-4 border-t pt-4">
                        <h3 className="font-semibold text-sm mb-3">
                          Question Images ({parsedQuestions.length} questions parsed)
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          Select which questions have images/diagrams and upload them. Questions without images will show as text-only.
                        </p>
                        <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                          {parsedQuestions.map((q, index) => (
                            <div key={index} className="flex items-start gap-3 bg-muted/30 rounded-lg p-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-primary shrink-0">Q{index + 1}</span>
                                  <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={q.hasImage}
                                      onChange={(e) => {
                                        setParsedQuestions(prev => prev.map((item, i) => 
                                          i === index ? { ...item, hasImage: e.target.checked } : item
                                        ));
                                        if (!e.target.checked) {
                                          handleRemoveQuestionImage(index);
                                        }
                                      }}
                                      className="h-3.5 w-3.5 rounded"
                                    />
                                    <span className="text-xs text-foreground">Has Image</span>
                                  </label>
                                </div>
                                <p className="text-xs text-muted-foreground truncate pr-4">{q.question}</p>
                                {q.hasImage && !questionImages[index] && (
                                  <div className="mt-2">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleQuestionImageUpload(index, file);
                                      }}
                                      className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary file:text-primary-foreground"
                                    />
                                  </div>
                                )}
                                {questionImages[index] && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <img src={questionImages[index]} alt={`Q${index + 1}`} className="h-10 w-10 object-cover rounded border" />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveQuestionImage(index)}
                                      className="text-xs text-destructive hover:underline"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="sm:col-span-2 flex justify-end">
                    <Button type="submit" disabled={createMockTest.isPending || uploading}>
                      {uploading ? "Creating..." : createMockTest.isPending ? "Adding..." : "Add Mock Test"}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Mock tests table */}
              <div className="bg-card border border-card-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-3">Title</th>
                      <th className="text-left px-4 py-3 hidden sm:table-cell">Section</th>
                      <th className="text-left px-4 py-3 hidden sm:table-cell">Subject</th>
                      <th className="text-left px-4 py-3 hidden md:table-cell">Duration</th>
                      <th className="text-left px-4 py-3 hidden md:table-cell">Questions</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(mockTests ?? []).map((test) => (
                      <tr key={test.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{test.title}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{test.section}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{test.subject}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{test.duration} min</td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{test.questionCount}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDeleteMockTest(test.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(mockTests ?? []).length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No mock tests yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
