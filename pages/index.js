import Head from "next/head"

export default function Home() {
  return (
    <>
      <Head>
        <title>Donut da Amizade</title>
        <link
          rel="icon"
          href={`data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍩</text></svg>`}
        />
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-orange-800 mb-4">🍩 Donut da Amizade</h1>
            <p className="text-lg text-orange-700 max-w-2xl mx-auto leading-relaxed">
              Em sinal da nossa amizade, decidi criar um álbum digital que reúne fotos e “mandamentos” como forma de mostrar o quanto me importo. Além de registrar lembranças, este espaço também é um exercício pessoal para me ajudar a melhorar na programação. Inspirado pelo donut, transformei essa ideia em um site especial.
            </p>
          </div>

          {/* Mandamentos */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-orange-800 mb-8 text-center">Mandamentos</h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-400 hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-semibold text-orange-800 mb-3 flex items-center">
                  🎫 1 - Vale Role Mensal
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Cada amigo tem direito a um "ticket" por mês para obrigar o outro a sair, sem desculpas! Não é
                  acumulativo, mas garante ao menos um momento juntos.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-amber-400 hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-semibold text-orange-800 mb-3 flex items-center">
                  💬 2 - Sinceridade Sempre
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Nada de mentir nem omitir quando algo estiver afetando a amizade. Comunicação é a base da confiança.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-400 hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-semibold text-orange-800 mb-3 flex items-center">
                  📱 3 - Contato Frequente
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Manter contato de forma natural e frequente. Seja para desabafar ou para falar besteira. Amigos são
                  rede de apoio.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-amber-400 hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-semibold text-orange-800 mb-3 flex items-center">
                  📸 4 - Memórias Registradas
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Sempre que possível, registrar os momentos em fotos. Criar lembranças é tão importante quanto
                  vivê-las.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-400 hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-semibold text-orange-800 mb-3 flex items-center">
                  🎉 5 - Celebrar Conquistas
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Nunca deixar passar em branco as pequenas ou grandes vitórias do outro. Amizade também é comemorar
                  juntos.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-amber-400 hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-semibold text-orange-800 mb-3 flex items-center">
                  🌱 6 - Respeitar Espaços
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Entender quando o outro precisa de tempo sozinho, sem interpretar isso como afastamento.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-400 hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-semibold text-orange-800 mb-3 flex items-center">
                  💝 7 - Cuidado Recíproco
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Pequenos gestos contam: perguntar se chegou bem, mandar mensagem inesperada, ou lembrar de algo
                  importante para o outro, coisas do tipo!
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-amber-400 hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-semibold text-orange-800 mb-3 flex items-center">🍽️ 8 - Comida!</h3>
                <p className="text-gray-700 leading-relaxed">
                  Comer juntos! Desde os tempos mais antigos, dividir comida foi uma forma natural de criar e fortalecer
                  laços, ta na genética.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-orange-800 mb-6 flex items-center">🚀 Próximos passos</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-orange-500 mr-3">•</span>
                Adicionar página de álbum com fotos e legendas (em desenvolvimento).
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-3">•</span>
                Adicionar lembretes automáticos para os Vale Roles.
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-3">•</span>
                Interagir para pensar em ideias juntos!
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
