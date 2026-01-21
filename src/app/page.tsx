export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-12 md:p-16">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <div className="text-6xl mb-2"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-3">
              Sistema The Rustic
            </h1>
            <p className="text-xl text-slate-600 font-light">
              Sistema de Gestión para Restaurantes
            </p>
            <div className="mt-4 h-1 w-24 bg-gradient-to-r from-orange-500 to-indigo-600 mx-auto rounded-full"></div>
          </div>

          {/* Access Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Waiter Access */}
            <a
              href="/login/waiter"
              className="group bg-white border-2 border-slate-200 p-10 rounded-lg hover:border-orange-400 hover:shadow-xl transition-all duration-300"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6 group-hover:bg-orange-200 transition-colors">
                  <span className="text-4xl">👨‍🍳</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">Portal de Meseros</h2>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Gestiona órdenes y pedidos de bebidas
                </p>
                <div className="inline-flex items-center gap-2 text-orange-600 font-semibold group-hover:gap-3 transition-all">
                  <span>Acceder</span>
                  <span>→</span>
                </div>
              </div>
            </a>

            {/* Admin Access */}
            <a
              href="/login/admin"
              className="group bg-white border-2 border-slate-200 p-10 rounded-lg hover:border-indigo-400 hover:shadow-xl transition-all duration-300"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-6 group-hover:bg-indigo-200 transition-colors">
                  <span className="text-4xl">⚙️</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">Panel Administrativo</h2>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Inventario, órdenes y contabilidad
                </p>
                <div className="inline-flex items-center gap-2 text-indigo-600 font-semibold group-hover:gap-3 transition-all">
                  <span>Acceder</span>
                  <span>→</span>
                </div>
              </div>
            </a>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center">
            <p className="text-slate-500 text-sm">
              © 2026 The Rustic. Sistema profesional de gestión de inventario.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
