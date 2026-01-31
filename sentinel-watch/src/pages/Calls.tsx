import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { CallRecord } from '@/types/dashboard';
import { Phone, Search, Filter, ArrowUpDown, PhoneOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/auth/useAuth';

const getRiskStatus = (risk: number) => {
  if (risk <= 25) return 'low';
  if (risk <= 50) return 'medium';
  if (risk <= 75) return 'high';
  return 'critical';
};

const getStatusType = (status: string) => {
  switch (status) {
    case 'completed': return 'success';
    case 'flagged': return 'warning';
    case 'escalated': return 'critical';
    case 'in_progress': return 'info';
    default: return 'info';
  }
};

const Calls = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 🔐 Auth guard
  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const filteredCalls = calls.filter(call =>
    call.caller.toLowerCase().includes(searchQuery.toLowerCase()) ||
    call.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 px-4">
          <div className="font-mono text-muted-foreground text-center">
            VERIFYING SESSION…
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl sm:text-4xl tracking-wider">
              CALL LOG
            </h1>
            <p className="text-sm font-mono text-muted-foreground mt-1">
              ALL PROCESSED CALLS
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 mb-6"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by caller name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-mono text-sm bg-muted/30"
              />
            </div>
            <Button variant="outline" className="font-mono text-xs gap-2">
              <Filter className="w-4 h-4" />
              FILTERS
            </Button>
            <Button variant="outline" className="font-mono text-xs gap-2">
              <ArrowUpDown className="w-4 h-4" />
              SORT
            </Button>
          </motion.div>

          {/* Calls Table */}
          <GlassCard variant="elevated">
            <GlassCardHeader>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs tracking-wider text-muted-foreground">
                  {calls.length} CALLS TODAY
                </span>
              </div>
            </GlassCardHeader>

            <GlassCardContent className="p-0 overflow-x-auto">
              {isLoading ? (
                <LoadingState message="LOADING CALL HISTORY..." />
              ) : filteredCalls.length === 0 ? (
                <EmptyState
                  icon={PhoneOff}
                  title={calls.length === 0 ? 'NO CALLS RECORDED' : 'NO MATCHING CALLS'}
                  description={
                    calls.length === 0
                      ? 'Call records will appear here as calls are processed'
                      : 'Try adjusting your search criteria'
                  }
                />
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">CALL ID</th>
                      <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">CALLER</th>
                      <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">RISK</th>
                      <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">STATUS</th>
                      <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">TIME</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCalls.map((call, i) => (
                      <motion.tr
                        key={call.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i }}
                        className="border-b border-border/30 hover:bg-muted/30"
                      >
                        <td className="px-4 py-3 font-mono text-sm text-primary">{call.id}</td>
                        <td className="px-4 py-3 text-sm">{call.caller}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={getRiskStatus(call.risk)} label={`${call.risk}`} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            status={getStatusType(call.status) as any}
                            label={call.status.toUpperCase()}
                          />
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {call.time}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </GlassCardContent>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};

export default Calls;
