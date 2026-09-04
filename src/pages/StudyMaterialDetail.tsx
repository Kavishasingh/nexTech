import { useEffect, useState, useCallback } from "react";
import { useParams } from "wouter";
import { Download, ArrowLeft, FileText, Lock, BookOpen, X, CreditCard, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useGetDocument,
  getGetDocumentQueryKey,
  useRecordDocumentView,
  useRecordDocumentDownload,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE } from "@/lib/api";

export function StudyMaterialDetail() {
  const { id } = useParams<{ id: string }>();
  const docId = parseInt(id ?? "0", 10);
  const { toast } = useToast();

  const proxyFileUrl = (type: "pdf" | "word" | "thumbnail") =>
    `${API_BASE}/api/documents/${docId}/download?type=${type}`;

  const [showWordModal, setShowWordModal] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const { data: doc, isLoading } = useGetDocument(docId, {
    query: { enabled: !!docId, queryKey: getGetDocumentQueryKey(docId) },
  });

  const recordView = useRecordDocumentView();
  const recordDownload = useRecordDocumentDownload();

  const getUserId = useCallback(async (): Promise<string | null> => {
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data } = await supabase.auth.getUser();
      return data.user?.id || null;
    } catch {
      return null;
    }
  }, []);

  const checkPaymentStatus = useCallback(async () => {
    if (!docId || doc?.isFree) return;
    setCheckingPayment(true);
    try {
      const userId = await getUserId();
      if (!userId) {
        setCheckingPayment(false);
        return;
      }
      const res = await fetch(`${API_BASE}/api/payments/check/${docId}?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        setHasPaid(data.hasPaid || false);
      }
    } catch {
      // ignore
    } finally {
      setCheckingPayment(false);
    }
  }, [docId, doc?.isFree, doc?.wordFileUrl, getUserId]);

  useEffect(() => {
    if (docId) recordView.mutate({ id: docId });
  }, [docId]);

  useEffect(() => {
    if (!doc?.fileUrl) {
      setPdfLoading(false);
      return;
    }
    setPdfLoading(true);
    let revoked = false;

    const loadPdf = async () => {
      try {
        await fetch(proxyFileUrl("pdf"));
      } catch {
        // ignore
      } finally {
        if (!revoked) setPdfLoading(false);
      }
    };

    loadPdf();

    return () => {
      revoked = true;
    };
  }, [doc?.fileUrl, docId]);

  useEffect(() => {
    checkPaymentStatus();
  }, [checkPaymentStatus]);

  useEffect(() => {
    if (razorpayLoaded) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [razorpayLoaded]);

  const handlePayment = async () => {
    if (!doc || !doc.price) return;
    setPaying(true);
    try {
      const userId = await getUserId();
      if (!userId) {
        toast({ title: "Please login first", description: "You need to be logged in to make a payment." });
        setPaying(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/razorpay/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: doc.id,
          amount: doc.price * 100,
          userId,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to create order" }));
        throw new Error(err.error || "Failed to create order");
      }

      const order = await res.json();

      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "OkSchool",
        description: `Unlock: ${doc.title}`,
        order_id: order.order_id,
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        qr_code: {
          enabled: true,
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch(`${API_BASE}/api/razorpay/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                documentId: doc.id,
                userId,
                amount: order.amount,
              }),
            });

            if (verifyRes.ok) {
              setHasPaid(true);
              setShowSuccessModal(true);
              setShowWordModal(false);
              toast({ title: "Payment successful!", description: "You can now download the Word file." });
            } else {
              const err = await verifyRes.json().catch(() => ({ error: "Verification failed" }));
              toast({ title: "Payment verification failed", description: err.error || "Please contact support.", variant: "destructive" });
            }
          } catch {
            toast({ title: "Payment verification error", description: "Please contact support.", variant: "destructive" });
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaying(false);
          },
        },
        onFailure: function (err: any) {
          setPaying(false);
          toast({ title: "Payment failed", description: err?.description || "Please try again.", variant: "destructive" });
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e) {
      setPaying(false);
      toast({ title: "Payment error", description: e instanceof Error ? e.message : "Please try again.", variant: "destructive" });
    }
  };

  const handleWordDownload = async () => {
    if (!doc) return;
    if (!hasPaid && doc.isFree === false && doc.wordFileUrl) {
      setShowWordModal(true);
      return;
    }
    await handleDownload("word");
  };

  const handleDownload = async (fileType: "pdf" | "word") => {
    if (!doc) return;
    recordDownload.mutate({ id: docId, data: { fileType } });
    const url = proxyFileUrl(fileType);
    if (!url) {
      toast({ title: "File not available", description: "The requested file URL is missing." });
      return;
    }
    try {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) throw new Error("fetch_failed");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${doc.title}${fileType === "pdf" ? ".pdf" : ".docx"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast({ title: `${fileType.toUpperCase()} download started`, description: doc.title });
    } catch (e) {
      window.open(url, "_blank");
      toast({ title: `${fileType.toUpperCase()} opened in new tab`, description: doc.title });
    }
  };

  const canDownloadWord = !doc?.isFree ? hasPaid : true;
  const showWordLocked = !doc?.isFree && !doc?.wordFileUrl;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4 max-w-4xl mx-auto">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <FileText className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-bold">Document not found</h2>
        <Link href="/"><Button variant="outline" className="mt-4">Go Home</Button></Link>
      </div>
    );
  }

  const hasWord = !!doc.wordFileUrl;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link href="/" data-testid="link-back">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-card border border-card-border rounded-xl overflow-hidden">
            <div className="bg-muted/50 border-b px-4 py-2 flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="truncate">{doc.title}</span>
            </div>
            <div className="h-[560px] bg-black/5 flex items-center justify-center" data-testid="document-preview">
              {pdfLoading ? (
                <div className="text-center text-muted-foreground">
                  <BookOpen className="h-16 w-16 mx-auto mb-3 text-muted-foreground/30 animate-pulse" />
                  <p className="text-sm">Loading preview...</p>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm mb-3">Click below to view the PDF</p>
                  {doc.fileUrl && (
                    <Button
                      onClick={() => window.open(proxyFileUrl("pdf"), "_blank")}
                      data-testid="button-open-pdf"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Open PDF
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-card-border rounded-xl p-5">
            <h1 className="font-serif text-lg font-bold text-foreground leading-snug mb-3">{doc.title}</h1>
            <p className="text-sm text-muted-foreground mb-4">{doc.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="capitalize text-xs">{doc.category.replace(/-/g, " ")}</Badge>
              <Badge className={doc.isFree ? "bg-green-100 text-green-700 border-green-200" : "bg-primary text-primary-foreground"}>
                {doc.isFree ? "FREE" : `₹${doc.price ?? 20}`}
              </Badge>
              {!doc.isFree && hasPaid && (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" /> Purchased
                </Badge>
              )}
            </div>

             <div className="space-y-3">
               <Button
                 className="w-full"
                 onClick={() => handleDownload("pdf")}
                 data-testid="button-download-pdf"
               >
                 <Download className="h-4 w-4 mr-2" />
                 Download PDF
               </Button>

               {doc.isFree ? (
                 <Button
                   className="w-full"
                   variant="outline"
                   onClick={() => handleDownload("word")}
                   disabled={!hasWord}
                   data-testid="button-download-word"
                 >
                   <Download className="h-4 w-4 mr-2" />
                   {hasWord ? "Download Word" : "Word Not Available"}
                 </Button>
               ) : (
                 <>
                   {hasPaid ? (
                     <Button
                       className="w-full"
                       variant="outline"
                       onClick={() => handleDownload("word")}
                       disabled={!hasWord}
                       data-testid="button-download-word"
                     >
                       <Download className="h-4 w-4 mr-2" />
                       Download Word
                     </Button>
                   ) : (
                     <Button
                       className="w-full"
                       variant="default"
                       onClick={handleWordDownload}
                       disabled={paying || !hasWord || checkingPayment}
                       data-testid="button-buy-word"
                     >
                       <CreditCard className="h-4 w-4 mr-2" />
                       {checkingPayment ? "Checking..." : paying ? "Processing..." : `₹${doc.price ?? 20} - Unlock Word`}
                     </Button>
                   )}
                   {!hasWord && (
                     <p className="text-xs text-muted-foreground text-center">Word file not available for this document.</p>
                   )}
                 </>
               )}
             </div>

             <Dialog open={showWordModal} onOpenChange={setShowWordModal}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Unlock Word File
                    </DialogTitle>
                    <DialogDescription>
                      Pay ₹{doc.price ?? 20} to unlock and download the Word file. QR code will be available during checkout.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      onClick={handlePayment}
                      disabled={paying}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {paying ? "Processing..." : `Pay ₹${doc.price ?? 20} Now`}
                    </Button>
                    <div className="flex justify-end">
                      <Button variant="outline" onClick={() => setShowWordModal(false)}>
                        <X className="h-4 w-4 mr-2" />
                        Close
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Payment Successful!
                    </DialogTitle>
                    <DialogDescription>
                      You can now download the Word file.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setShowSuccessModal(false)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Word
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-4 text-sm space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>File Type</span><span className="font-medium text-foreground uppercase">{doc.fileType}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Category</span><span className="font-medium text-foreground capitalize">{doc.category.replace(/-/g, " ")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
