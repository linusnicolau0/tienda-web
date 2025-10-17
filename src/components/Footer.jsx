export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">NEW<span className="text-primary">ERA</span></h3>
            <p className="text-gray-400">Ropa premium para el estilo de vida moderno</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Atención al Cliente</h4>
            <div className="space-y-2 text-gray-400">
              <a href="#" className="block hover:text-primary transition-colors">Contáctanos</a>
              <a href="#" className="block hover:text-primary transition-colors">Guía de Tallas</a>
              <a href="#" className="block hover:text-primary transition-colors">Devoluciones</a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Empresa</h4>
            <div className="space-y-2 text-gray-400">
              <a href="#" className="block hover:text-primary transition-colors">Sobre Nosotros</a>
              <a href="#" className="block hover:text-primary transition-colors">Carreras</a>
              <a href="#" className="block hover:text-primary transition-colors">Prensa</a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Síguenos</h4>
            <div className="space-y-2 text-gray-400">
              <a href="#" className="block hover:text-primary transition-colors">Instagram</a>
              <a href="#" className="block hover:text-primary transition-colors">Facebook</a>
              <a href="#" className="block hover:text-primary transition-colors">Twitter</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
