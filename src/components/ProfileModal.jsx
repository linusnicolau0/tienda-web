import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/supabase';

export const ProfileModal = ({ isOpen, onClose, onLoginClick, onRegisterClick, cartCount, cartTotal }) => {
  const { user, signOut } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (isOpen && user) {
      loadOrders();
    }
  }, [isOpen, user]);

  const loadOrders = async () => {
    try {
      const userOrders = await orderService.getUserOrders(user.id);
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Mi Perfil</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl leading-none">
            ×
          </button>
        </div>

        <div className="p-6">
          {!user ? (
            <div className="text-center space-y-6">
              <div className="text-6xl">👤</div>
              <h3 className="text-2xl font-bold">Bienvenido a NEW ERA</h3>
              <p className="text-gray-600">
                Inicia sesión o regístrate para acceder a todas las funcionalidades
              </p>

              <div className="space-y-2 py-4">
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  ✓ Guarda tus productos favoritos
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  ✓ Rastrea tus pedidos
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  ✓ Accede a ofertas exclusivas
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  ✓ Historial de compras
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    onClose();
                    onRegisterClick();
                  }}
                  className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                >
                  Registrarse
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onLoginClick();
                  }}
                  className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Iniciar Sesión
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Información Personal</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre:</span>
                    <span className="font-medium">{user.user_metadata?.full_name || 'Usuario'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Resumen del Carrito</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Productos en carrito:</span>
                    <span className="font-medium">{cartCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium text-primary">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Historial de Pedidos</h3>
                {orders.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No tienes pedidos anteriores
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => {
                      const itemCount = order.order_items.reduce((sum, item) => sum + item.quantity, 0);
                      const orderDate = new Date(order.created_at).toLocaleDateString('es-ES');

                      return (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between mb-2">
                            <strong>Pedido #{order.id}</strong>
                            <span className="text-gray-600">{orderDate}</span>
                          </div>
                          <div className="text-gray-600 text-sm">
                            {itemCount} artículo(s) - Total: <strong className="text-primary">${order.total_amount}</strong>
                          </div>
                          <div className={`mt-2 ${order.status === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>
                            Estado: {order.status === 'completed' ? 'Completado' : 'Pendiente'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
