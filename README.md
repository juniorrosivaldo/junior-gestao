# junior-gestao

Planejamento pessoal, projetos e checklists, com base reutilizável para a RBC Motores.

Aplicação responsiva em português, feita com React e Vite. A identidade usa azul-marinho `#0B2545`, azul `#1465D6`, ciano `#38BDF8` e fundo `#F5F7FA`. As fontes são incluídas na aplicação, sem depender de serviços externos em tempo de execução.

## Executar

Use Node.js 24 LTS e npm. Na raiz do repositório:

```bash
npm ci --cache /tmp/junior-npm-cache
npm run dev
```

O Vite inicia na porta 5173. Para gerar e testar a versão de produção:

```bash
npm run build
npm run preview
```

## Publicação da demonstração

A configuração do Vite usa caminhos relativos para que o build funcione em `/junior-gestao/` no GitHub Pages. O workflow `.github/workflows/deploy-pages.yml` instala as dependências com Node.js 24, gera o site e publica somente `dist` quando há um push na branch `main`. Também pode ser iniciado manualmente na aba **Actions**.

No repositório GitHub, abra **Settings → Pages → Build and deployment** e escolha **Source: GitHub Actions**. Após enviar os arquivos para `main`, acompanhe o workflow **Publicar demonstração no GitHub Pages** na aba **Actions**. Quando a implantação terminar, use o endereço apresentado pelo GitHub Pages; o endereço previsto é `https://juniorrosivaldo.github.io/junior-gestao/`.

**Publicar o ambiente na nuvem não publica o site.** O ambiente prepara a máquina de desenvolvimento; o endereço público só fica disponível após a implantação do GitHub Pages. O site expõe os exemplos de demonstração incluídos no código. Alterações feitas por cada visitante continuam salvas apenas no navegador desse visitante.

## Funcionalidades

- **Meu painel:** até três prioridades por data, responsáveis, próximos passos, pendências e cinco hábitos diários.
- **Projetos:** seis frentes e lista central de tarefas, com filtros por frente e situação e busca por tarefa ou responsável.
- **Checklists:** etapas editáveis; concluir uma tarefa exige uma evidência registrada.
- **Registros:** avanços, decisões, bloqueios e fechamento do dia, com próximo passo e filtro por data.
- **RBC Motores:** base de adaptação com três OS de demonstração, fotos de antes/processo/final e checklist de treinamento. Aceita JPG, PNG e WebP de até 2 MB, reduzindo a cópia local para economizar armazenamento.
- **Celular:** cartões em coluna, navegação inferior e acesso às mesmas funções do computador.

## Dados e referências

Os exemplos iniciais derivam do `Plano_de_Foco_Junior_13-10-2026.pdf`. A primeira data do painel é 14/10/2026, início do ciclo proposto no plano. Datas, papéis, OS e tarefas são **dados de demonstração**, não provas de execução ou registros operacionais validados.

As referências 01 (computador), 02 (celular) e 03 (RBC) foram interpretadas a partir da descrição do pedido; os três mockups visuais não estavam presentes no PDF fornecido. A área RBC prepara uma adaptação futura e deve passar pela validação do responsável técnico antes de uso operacional.

Os dados ficam no `localStorage` deste navegador, sob a chave `junior-gestao:v1`. Não há backend, autenticação, sincronização entre dispositivos ou compartilhamento com a equipe. A exportação JSON inclui tarefas, hábitos, registros e fotos; a importação ainda não está implementada. Limpar os dados do navegador remove os registros locais. Falhas de armazenamento são comunicadas na interface.

A configuração das frentes e os exemplos estão em `src/data.js`; componentes e interações em `src/App.jsx`; identidade e layouts em `src/styles.css`.

## Verificação

Os testes Playwright cobrem limite de prioridades, criação de tarefas e checklists, evidência de conclusão, persistência, hábitos por data, registros, exportação, fotos, treinamento, navegação móvel, falha de armazenamento e acessibilidade do painel.

Com Chromium instalado nesta máquina:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test
```

Em outra máquina, instale o navegador do Playwright e execute:

```bash
npx playwright install chromium
npm test
```
