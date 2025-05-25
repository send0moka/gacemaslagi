"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { Card } from "@/components/ui/card"
import { 
  UserCircle, 
  Brain, 
  ScrollText, 
  MessageSquare, 
  Calendar,
  Activity,
  Stethoscope,
  Network,
  CheckCircle,
  XCircle
} from "lucide-react"

interface Article {
  title: string
  created_at: string
}

interface DashboardStats {
  totalUsers: number
  totalExperts: number
  totalArticles: number
  totalFeedbacks: number
  totalConsultations: number
  totalSymptoms: number
  totalDiseases: number
  totalDiagnoses: number
  recentArticles: Article[]
  pendingConsultations: number
  todayConsultations: number
  weeklyGrowth: {
    users: number
    consultations: number
  }
  consultationStats: {
    pending: number
    accepted: number
    rejected: number
  }
  todayStats: {
    newUsers: number
    newArticles: number
    newFeedbacks: number
    newDiagnoses: number
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalExperts: 0,
    totalArticles: 0,
    totalFeedbacks: 0,
    totalConsultations: 0,
    totalSymptoms: 0,
    totalDiseases: 0,
    totalDiagnoses: 0,
    recentArticles: [],
    pendingConsultations: 0,
    todayConsultations: 0,
    weeklyGrowth: {
      users: 0,
      consultations: 0
    },
    consultationStats: {
      pending: 0,
      accepted: 0,
      rejected: 0
    },
    todayStats: {
      newUsers: 0,
      newArticles: 0,
      newFeedbacks: 0,
      newDiagnoses: 0
    }
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const supabase = createClient()
    const today = new Date()
    const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString()
    
    try {
      const [
        usersData,
        articlesData,
        feedbacksCount,
        consultationsCount,
        symptomsCount,
        diseasesCount,
        diagnosesCount,
        recentArticles,
        consultationData,
        todayUsers,
        todayArticles,
        todayFeedbacks,
        todayDiagnoses
      ] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('articles').select('*', { count: 'exact', head: true }),
        supabase.from('feedbacks').select('*', { count: 'exact', head: true }),
        supabase.from('consultation_requests').select('*', { count: 'exact', head: true }),
        supabase.from('symptoms').select('*', { count: 'exact', head: true }),
        supabase.from('diseases').select('*', { count: 'exact', head: true }),
        supabase.from('diagnoses').select('*', { count: 'exact', head: true }),
        // Get 5 most recent articles
        supabase
          .from('articles')
          .select('title, created_at')
          .order('created_at', { ascending: false })
          .limit(5),

        // Get consultation statistics
        supabase
          .from('consultation_requests')
          .select('created_at, status'),

        // Get today's statistics
        supabase.from('users').select('*').gte('created_at', todayStart),
        supabase.from('articles').select('*').gte('created_at', todayStart),
        supabase.from('feedbacks').select('*').gte('created_at', todayStart),
        supabase.from('diagnoses').select('*').gte('created_at', todayStart)
      ])

      // Process consultation data
      const consultations = consultationData.data || []
      
      // Filter today's consultations using the today variable
      const todayStr = today.toDateString()
      const todayConsultations = consultations.filter(c => 
        new Date(c.created_at).toDateString() === todayStr
      ).length

      // Calculate consultation stats
      const consultationStats = {
        pending: consultations.filter(c => c.status === 'pending').length,
        accepted: consultations.filter(c => c.status === 'accepted').length,
        rejected: consultations.filter(c => c.status === 'rejected').length
      }

      const todayStats = {
        newUsers: todayUsers.data?.length || 0,
        newArticles: todayArticles.data?.length || 0,
        newFeedbacks: todayFeedbacks.data?.length || 0,
        newDiagnoses: todayDiagnoses.data?.length || 0
      }

      setStats({
        totalUsers: usersData.data?.length || 0,
        totalExperts: usersData.data?.filter(user => user.is_expert).length || 0,
        totalArticles: articlesData.count || 0,
        totalFeedbacks: feedbacksCount.count || 0,
        totalConsultations: consultationsCount.count || 0,
        totalSymptoms: symptomsCount.count || 0,
        totalDiseases: diseasesCount.count || 0,
        totalDiagnoses: diagnosesCount.count || 0,
        recentArticles: recentArticles.data || [],
        pendingConsultations: consultations.filter(c => c.status === 'pending').length,
        todayConsultations,
        weeklyGrowth: {
          users: 0,
          consultations: 0
        },
        consultationStats,
        todayStats
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  interface StatCardProps {
    title: string;
    value: number;
    icon: React.ElementType;
  }

  const StatCard = ({ title, value, icon: Icon }: StatCardProps) => (
    <Card className="p-6 flex items-center justify-center gap-4">
      <div className="bg-gray-100 p-3 rounded-full">
        <Icon className="h-6 w-6 text-gray-600" />
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-500">{title}</p>
        {isLoading ? (
          <div className="animate-pulse h-7 w-16 bg-gray-200 rounded mt-1"></div>
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </div>
    </Card>
  )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers}
          icon={UserCircle}
        />
        <StatCard 
          title="Expert Psychiatrists" 
          value={stats.totalExperts}
          icon={Brain}
        />
        <StatCard 
          title="Articles" 
          value={stats.totalArticles}
          icon={ScrollText}
        />
        <StatCard 
          title="Feedbacks" 
          value={stats.totalFeedbacks}
          icon={MessageSquare}
        />
        <StatCard 
          title="Consultation Requests" 
          value={stats.totalConsultations}
          icon={Calendar}
        />
        <StatCard 
          title="Symptoms" 
          value={stats.totalSymptoms}
          icon={Activity}
        />
        <StatCard 
          title="Diseases" 
          value={stats.totalDiseases}
          icon={Stethoscope}
        />
        <StatCard 
          title="Diagnoses Made" 
          value={stats.totalDiagnoses}
          icon={Network}
        />
      </div>

      <Card className="col-span-full mt-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Articles</h2>
          <div className="space-y-2">
            {stats.recentArticles.map((article, i) => (
              <div key={i} className="flex justify-between items-center">
                <span>{article.title}</span>
                <span className="text-sm text-gray-500">
                  {new Date(article.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Today&apos;s Activity</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                New Users
              </span>
              <span className="font-bold text-blue-600">{stats.todayStats.newUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <ScrollText className="h-4 w-4" />
                New Articles
              </span>
              <span className="font-bold text-green-600">{stats.todayStats.newArticles}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                New Feedbacks
              </span>
              <span className="font-bold text-purple-600">{stats.todayStats.newFeedbacks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                New Diagnoses
              </span>
              <span className="font-bold text-orange-600">{stats.todayStats.newDiagnoses}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Consultation Requests</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Pending
              </span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                {stats.consultationStats.pending}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Accepted
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {stats.consultationStats.accepted}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Rejected
              </span>
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                {stats.consultationStats.rejected}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
