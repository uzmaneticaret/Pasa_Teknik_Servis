'use client';

import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  LayoutDashboard, 
  Users, 
  Wrench, 
  DollarSign, 
  Search, 
  Bell,
  LogOut,
  Settings,
  FileText,
  ChevronRight,
  ChevronDown,
  Target,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface SidebarNavProps {
  onLogout: () => void;
}

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: LayoutDashboard,
    description: 'Genel bakış ve istatistikler'
  },
  { 
    name: 'Müşteriler', 
    href: '/customers', 
    icon: Users,
    description: 'Müşteri yönetimi'
  },
  { 
    name: 'Servisler', 
    href: '/services', 
    icon: Wrench,
    description: 'Servis takibi'
  },
  { 
    name: 'Finans', 
    href: '/finance', 
    icon: DollarSign,
    description: 'Gelir-gider takibi'
  },
  { 
    name: 'Müşteri Analitiği', 
    href: '/customer-analytics', 
    icon: Target,
    description: 'Sadakat programı ve segmentasyon'
  },
  { 
    name: 'Teknisyen Performansı', 
    href: '/technician-analytics', 
    icon: TrendingUp,
    description: 'Performans metrikleri'
  },
  { 
    name: 'Raporlar', 
    href: '/reports', 
    icon: FileText,
    description: 'Analiz ve raporlama'
  },
  { 
    name: 'Görsel Dashboard', 
    href: '/dashboard-visual', 
    icon: LayoutDashboard,
    description: 'Interactive grafikler'
  },
  { 
    name: 'Arama', 
    href: '/search', 
    icon: Search,
    description: 'Gelişmiş arama'
  },
  { 
    name: 'Bildirimler', 
    href: '/notifications', 
    icon: Bell,
    description: 'Bildirim yönetimi',
    badge: 3 // Örnek bildirim sayısı
  },
  { 
    name: 'Ayarlar', 
    href: '/settings', 
    icon: Settings,
    description: 'Sistem ayarları'
  },
];

export function SidebarNav({ onLogout }: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (href: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(href)) {
      newExpanded.delete(href);
    } else {
      newExpanded.add(href);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 border-r border-slate-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-slate-200 dark:border-gray-700 px-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PAŞA Servis
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Yönetim Paneli</p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-1">
          <AnimatePresence>
            {navigation.map((item, index) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start h-12 px-4 relative group hover:bg-slate-100 dark:hover:bg-gray-800 transition-all duration-200",
                      isActive && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600"
                    )}
                    onClick={() => router.push(item.href)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Icon className={cn(
                        "h-5 w-5 transition-colors",
                        isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                      )} />
                      <div className="flex-1 text-left">
                        <span className={cn(
                          "font-medium transition-colors",
                          isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                        )}>
                          {item.name}
                        </span>
                        <p className={cn(
                          "text-xs transition-colors",
                          isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                        )}>
                          {item.description}
                        </p>
                      </div>
                      {item.badge && (
                        <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          {item.badge}
                        </Badge>
                      )}
                      <ChevronRight className={cn(
                        "h-4 w-4 transition-transform",
                        isActive ? "text-blue-600 dark:text-blue-400 rotate-90" : "text-gray-400 dark:text-gray-600"
                      )} />
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </nav>
      </div>

      {/* User Section */}
      <div className="border-t border-slate-200 dark:border-gray-700 p-4 bg-slate-50 dark:bg-gray-800/50">
        <div className="space-y-3">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tema
            </span>
            <ThemeToggle />
          </div>

          {/* User Info */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
                <Badge variant="outline" className="mt-1 text-xs">
                  {user?.role === 'ADMIN' ? 'Yönetici' : 'Teknisyen'}
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Logout Button */}
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Çıkış Yap
          </Button>
        </div>
      </div>
    </div>
  );
}