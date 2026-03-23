import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { 
  BookOpen, Loader2, Download, Eye, Search, Library, ExternalLink, Filter
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const Books = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSource, setFilterSource] = useState<string>("all");

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const [materialsRes, libraryRes] = await Promise.all([
          api.get("/teacher/materials"),
          api.get("/library/items?type=Book")
        ]);

        const myBooks = (materialsRes.data || [])
          .filter((m: any) => m.type === "Book")
          .map((m: any) => ({
            ...m,
            source: "My Material",
            displaySubject: m.subjects?.name || "N/A",
            displayAuthor: "You",
            displayClass: m.classes?.name || "N/A",
            iconColor: "text-emerald-500",
            bgColor: "bg-emerald-50",
            borderColor: "border-emerald-100"
          }));

        const libraryBooks = (libraryRes.data || []).map((l: any) => ({
          ...l,
          source: "Library",
          displaySubject: l.library_categories?.name || "Library",
          displayAuthor: l.author || "Unknown",
          displayClass: "General",
          iconColor: "text-blue-500",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-100"
        }));

        const combined = [...myBooks, ...libraryBooks];
        setBooks(combined);
        setFilteredBooks(combined);
      } catch (err) {
        console.error("Failed to fetch books:", err);
        toast.error("Failed to load books");
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    let result = books;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.title?.toLowerCase().includes(query) ||
        b.displaySubject?.toLowerCase().includes(query) ||
        b.displayAuthor?.toLowerCase().includes(query)
      );
    }
    
    if (filterSource !== "all") {
      result = result.filter(b => b.source === filterSource);
    }
    
    setFilteredBooks(result);
  }, [searchQuery, filterSource, books]);

  const handleViewBook = (book: any) => {
    const url = book.file_url || book.content_link;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <PortalLayout type="teacher">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout type="teacher">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <BookOpen className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Books & Resources</h1>
              <p className="text-muted-foreground">Access library collections and your own published books</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search books..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={filterSource === "all" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilterSource("all")}
              >
                All
              </Button>
              <Button 
                variant={filterSource === "My Material" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilterSource("My Material")}
              >
                My Books
              </Button>
              <Button 
                variant={filterSource === "Library" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilterSource("Library")}
              >
                Library
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredBooks.length}</span> resources
          </p>
        </div>

        {filteredBooks.length === 0 ? (
          <Card className="border-dashed py-20">
            <CardContent className="flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Library className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No books found</h3>
              <p className="text-muted-foreground max-w-sm">
                Try adjusting your search or filters. You can also upload new books in the Content Studio.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book, index) => (
              <Card 
                key={`${book.source}-${book.id}`} 
                className="group hover:shadow-xl transition-all duration-300 border-slate-100 overflow-hidden flex flex-col"
              >
                <div className={`h-32 ${book.bgColor} flex items-center justify-center relative p-6 transition-colors group-hover:bg-opacity-80`}>
                  <div className="p-4 bg-white rounded-2xl shadow-sm transform group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className={`w-8 h-8 ${book.iconColor}`} />
                  </div>
                  <Badge className="absolute top-3 left-3 bg-white text-slate-900 border-none shadow-sm hover:bg-white capitalize">
                    {book.source === "My Material" ? "Published" : "Library"}
                  </Badge>
                </div>
                
                <CardHeader className="p-5 pb-2">
                  <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                    {book.title}
                  </CardTitle>
                  <p className="text-sm text-slate-500 font-medium">{book.displaySubject}</p>
                </CardHeader>
                
                <CardContent className="p-5 pt-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <span>By {book.displayAuthor}</span>
                    <span>•</span>
                    <span>{book.displayClass}</span>
                  </div>
                </CardContent>
                
                <CardFooter className="p-5 pt-0 gap-2 border-t border-slate-50 mt-auto pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2" 
                    size="sm"
                    onClick={() => handleViewBook(book)}
                  >
                    <Eye size={16} /> View
                  </Button>
                  {book.file_url && (
                    <Button 
                      variant="outline" 
                      className="gap-2" 
                      size="sm" 
                      asChild
                    >
                      <a href={book.file_url} target="_blank" rel="noopener noreferrer">
                        <Download size={16} />
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default Books;