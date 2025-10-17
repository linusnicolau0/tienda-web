import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Header = ({
  onFilterChange,
  onSearchChange,
  cartCount,
  onCartOpen,
  onProfileOpen,
  onAdminOpen,
  isAdmin
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const { user } = useAuth();

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    onFilterChange(filter);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">
              NEW<span className="text-primary">ERA</span>
            </h1>
          </div>

          <div className="hidden md:flex space-x-6">
            <button
              onClick={() => handleFilterClick('all')}
              className={`font-medium transition-colors ${
                activeFilter === 'all' ? 'text-primary border-b-2 border-primary' : 'text-gray-700 hover:text-primary'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => handleFilterClick('hombre')}
              className={`font-medium transition-colors ${
                activeFilter === 'hombre' ? 'text-primary border-b-2 border-primary' : 'text-gray-700 hover:text-primary'
              }`}
            >
              Hombres
            </button>
            <button
              onClick={() => handleFilterClick('mujer')}
              className={`font-medium transition-colors ${
                activeFilter === 'mujer' ? 'text-primary border-b-2 border-primary' : 'text-gray-700 hover:text-primary'
              }`}
            >
              Mujeres
            </button>
            <button
              onClick={() => handleFilterClick('ofertas')}
              className={`font-medium transition-colors ${
                activeFilter === 'ofertas' ? 'text-primary border-b-2 border-primary' : 'text-gray-700 hover:text-primary'
              }`}
            >
              Ofertas
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Buscar productos..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-48 lg:w-64"
              />
              <button className="absolute right-2 top-2 text-gray-500">
                🔍
              </button>
            </div>

            {isAdmin && (
              <button
                onClick={onAdminOpen}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ⚙️
              </button>
            )}

            <button
              onClick={onProfileOpen}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              👤
            </button>

            <button
              onClick={onCartOpen}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              🛒
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};
