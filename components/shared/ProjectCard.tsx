import { Clock, GitBranch } from 'lucide-react'

interface ProjectCardProps {
  name: string
  status: string
  techTags: string[]
  progress: number
  lastActive: string
}

export default function ProjectCard({ name, status, techTags, progress, lastActive }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'planning':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">{name}</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-3">
        {techTags.map((tag, index) => (
          <span
            key={index}
            className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded"
          >
            {tag}
          </span>
        ))}
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      <div className="flex items-center text-xs text-muted-foreground">
        <Clock className="h-3 w-3 mr-1" />
        Last active {lastActive}
      </div>
    </div>
  )
}
