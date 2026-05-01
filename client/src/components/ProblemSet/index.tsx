import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Code2, Loader2 } from 'lucide-react'
import SEO from '../SEO/SEO'

interface Category {
  name: string
  slug: string
}

export default function ProblemSet() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/challenges/filter-options`
        )
        
        if (!response.ok) throw new Error('Failed to fetch filter options')
        
        const data = await response.json()
        
        if (data.categories && Array.isArray(data.categories)) {
          const categoryData = data.categories.map((cat: string) => ({
            name: cat,
            slug: cat.toLowerCase().replace(/\s+/g, '-')
          }))
          
          setCategories(categoryData)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

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
        title="Problem Set | Browse Coding Problems by Category"
        description="Explore coding problems organized by categories. Find algorithms, data structures, and programming challenges from LeetCode, GeeksforGeeks, and more."
        keywords="coding problems, algorithms, data structures, programming categories, leetcode, geeksforgeeks"
      />
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Problem Set</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse coding problems organized by categories. Choose a topic to explore related challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.slug} 
              to={`/problemset/category/${category.slug}?name=${encodeURIComponent(category.name)}`}
              className="group"
            >
              <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group-hover:border-primary/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Code2 className="h-8 w-8 text-primary" />
                    <Badge variant="secondary" className="ml-2">
                      Topic
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {category.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Explore {category.name.toLowerCase()} problems
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}