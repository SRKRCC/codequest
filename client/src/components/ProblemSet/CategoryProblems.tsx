import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ExternalLink, Loader2, ArrowLeft } from 'lucide-react'
import SEO from '../SEO/SEO'

interface Problem {
  _id: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  platform: 'LeetCode' | 'GFG' | 'CodeChef' | 'Codeforces'
  problemLink?: string
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalProblems: number
  hasNext: boolean
  hasPrev: boolean
}

export default function CategoryProblems() {
  const { categoryName } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [actualCategoryName, setActualCategoryName] = useState<string>('')
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalProblems: 0,
    hasNext: false,
    hasPrev: false
  })

  const currentPage = parseInt(searchParams.get('page') || '1')
  const categoryNameFromURL = searchParams.get('name') || ''

  useEffect(() => {
    const fetchProblems = async () => {
      if (!categoryName) return
      
      setLoading(true)
      try {
        // Use the category name passed from URL parameter
        const actualCategory = categoryNameFromURL || formatCategoryName(categoryName)
        setActualCategoryName(actualCategory)
        
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/challenges?page=${currentPage}&limit=10&category=${actualCategory}`
        )
        
        if (!response.ok) throw new Error('Failed to fetch problems')
        
        const data = await response.json()
        
        setProblems(data.challenges || [])
        setPagination({
          currentPage: data.currentPage || 1,
          totalPages: data.totalPages || 1,
          totalProblems: data.totalChallenges || 0,
          hasNext: data.hasNextPage || false,
          hasPrev: data.hasPreviousPage || false
        })
      } catch (error) {
        console.error('Error fetching problems:', error)
        setProblems([])
      } finally {
        setLoading(false)
      }
    }

    fetchProblems()
  }, [categoryName, currentPage, categoryNameFromURL])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setSearchParams({ page: newPage.toString() })
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      case 'Hard': return 'bg-red-100 text-red-800 hover:bg-red-200'
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'LeetCode': return 'bg-orange-100 text-orange-800'
      case 'GFG': return 'bg-green-100 text-green-800'
      case 'CodeChef': return 'bg-brown-100 text-brown-800'
      case 'Codeforces': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCategoryName = (slug?: string) => {
    if (!slug) return ''
    return slug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <SEO 
        title={`${actualCategoryName || formatCategoryName(categoryName)} Problems | CodeQuest`}
        description={`Solve ${actualCategoryName || formatCategoryName(categoryName)} coding problems and challenges. Practice algorithms and data structures with problems from LeetCode, GeeksforGeeks, and more.`}
        keywords={`${actualCategoryName || categoryName} problems, ${actualCategoryName || categoryName} algorithms, coding challenges, programming practice`}
      />
      <div className="container mx-auto px-4 py-8 min-h-screen">
        {/* Header with back navigation */}
        <div className="mb-8">
          <Link 
            to="/problemset"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Problem Set
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{actualCategoryName || formatCategoryName(categoryName)} Problems</h1>
              <p className="text-muted-foreground mt-2">
                {pagination.totalProblems > 0 
                  ? `${pagination.totalProblems} problems available` 
                  : 'No problems found'}
              </p>
            </div>
          </div>
        </div>

        {/* Problems List */}
        {problems.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Problems</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {problems.map((problem, index) => (
                  <a 
                    key={problem._id}
                    href={problem.problemLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <span className="text-sm text-muted-foreground w-8">
                        {(pagination.currentPage - 1) * 10 + index + 1}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-medium">{problem.title}</h3>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant="secondary" 
                        className={getDifficultyColor(problem.difficulty)}
                      >
                        {problem.difficulty}
                      </Badge>
                      
                      <Badge 
                        variant="outline" 
                        className={getPlatformColor(problem.platform)}
                      >
                        {problem.platform}
                      </Badge>
                      
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No problems found for this category.</p>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(page => {
                  const distance = Math.abs(page - currentPage)
                  return distance <= 2 || page === 1 || page === pagination.totalPages
                })
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="min-w-[40px]"
                    >
                      {page}
                    </Button>
                  </div>
                ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNext}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Results info */}
        {pagination.totalProblems > 0 && (
          <div className="text-center text-sm text-muted-foreground mt-4">
            Showing {(pagination.currentPage - 1) * 10 + 1} - {Math.min(pagination.currentPage * 10, pagination.totalProblems)} of {pagination.totalProblems} problems
          </div>
        )}
      </div>
    </>
  )
}