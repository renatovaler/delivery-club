import React, { useState, useEffect, useCallback } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { 
    Bell, 
    CheckCheck, 
    Loader2, 
    BellRing, 
    UserPlus, 
    PauseCircle, 
    PlayCircle, 
    XCircle, 
    Building2,
    AlertTriangle,
    MapPin
} from 'lucide-react';

const iconMap = {
    BellRing,
    UserPlus,
    PauseCircle,
    PlayCircle,
    XCircle,
    Building2,
    AlertTriangle,
    MapPin
};

const NotificationIcon = ({ name }) => {
    const IconComponent = iconMap[name] || BellRing;
    return <IconComponent className="w-5 h-5" />;
};

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setHasError(false);
    
    try {
      // Dinamicamente importar a entidade Notification
      const { Notification } = await import('@/api/entities');
      const userNotifications = await Notification.filter({ user_id: user.id }, '-created_date', 20);
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => n.status === 'unread').length);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
      setHasError(true);
      // Silenciosamente falhar - não mostrar toast para não poluir interface
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    // Adicionar um intervalo para buscar notificações periodicamente
    const interval = setInterval(fetchNotifications, 60000); // a cada 1 minuto
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const { Notification } = await import('@/api/entities');
      await Notification.update(notificationId, { status: 'read' });
      const newNotifications = notifications.map(n => n.id === notificationId ? { ...n, status: 'read' } : n);
      setNotifications(newNotifications);
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    try {
        const { Notification } = await import('@/api/entities');
        const unreadNotifications = notifications.filter(n => n.status === 'unread');
        await Promise.all(
            unreadNotifications.map(n => Notification.update(n.id, { status: 'read' }))
        );
        fetchNotifications();
    } catch (error) {
        console.error("Erro ao marcar todas como lidas:", error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-amber-100">
          <Bell className="h-5 w-5 text-amber-800" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-600 text-white animate-pulse">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 md:w-96 mr-4 shadow-2xl border-amber-200">
        <div className="p-2">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-amber-900">Notificações</h4>
            {unreadCount > 0 && !hasError && (
                <Button 
                    variant="link" 
                    size="sm" 
                    onClick={handleMarkAllAsRead} 
                    disabled={isLoading}
                    className="text-amber-600 hover:text-amber-800"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCheck className="w-4 h-4 mr-1"/>}
                    Marcar todas como lidas
                </Button>
            )}
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {hasError ? (
                <div className="text-center p-4">
                    <AlertTriangle className="w-6 h-6 mx-auto text-amber-500 mb-2" />
                    <p className="text-sm text-amber-600">Sistema de notificações indisponível</p>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={fetchNotifications}
                        className="mt-2"
                    >
                        Tentar novamente
                    </Button>
                </div>
            ) : isLoading && notifications.length === 0 ? (
                <div className="text-center p-4">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500" />
                </div>
            ) : notifications.length > 0 ? (
              notifications.map(notification => (
                <Link
                  key={notification.id}
                  to={notification.link_to || '#'}
                  onClick={() => handleMarkAsRead(notification.id)}
                  className={`block p-3 rounded-lg transition-colors ${
                    notification.status === 'unread' ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${notification.status === 'unread' ? 'text-amber-600' : 'text-gray-400'}`}>
                        <NotificationIcon name={notification.icon}/>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-amber-900">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    {notification.status === 'unread' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-2 shadow-md self-center"></div>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-sm text-gray-500 py-8">Nenhuma notificação</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}