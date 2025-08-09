import { Order } from "@/types/order";

export const useOrderPrint = () => {
  const printOrder = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    const currentDate = new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const formatCurrency = (value: string | null) => {
      if (!value) return "0,00";
      
      // Remove caracteres não numéricos exceto vírgula e ponto
      const cleanValue = value.replace(/[^\d,.-]/g, "");
      
      // Se já tem vírgula, use como está
      if (cleanValue.includes(",")) {
        return cleanValue;
      }
      
      // Se tem ponto, converte para vírgula
      if (cleanValue.includes(".")) {
        return cleanValue.replace(".", ",");
      }
      
      // Se é só número, adiciona ,00
      return cleanValue + ",00";
    };

    const parseValue = (value: string | null): number => {
      if (!value) return 0;
      
      // Remove caracteres não numéricos exceto vírgula e ponto
      const cleanValue = value.replace(/[^\d,.-]/g, "");
      
      // Converte vírgula para ponto para cálculo
      const numericValue = cleanValue.replace(",", ".");
      
      return parseFloat(numericValue) || 0;
    };

    const calculateTotal = () => {
      // Primeiro verifica se já temos valor_total no banco
      if (order.valor_total) {
        return formatCurrency(order.valor_total);
      }
      
      // Se não, calcula somando valor_pedido + taxa_entrega
      const valorPedido = parseValue(order.valor_pedido);
      const taxaEntrega = parseValue(order.taxa_entrega);
      const total = valorPedido + taxaEntrega;
      
      return total.toFixed(2).replace(".", ",");
    };

    // Formatar itens - cada item em uma linha separada
    const formatItens = (itens: string | null) => {
      if (!itens) return "Itens não informados";
      
      // Normaliza e separa itens por quebra de linha, ponto e vírgula, vírgula ou bullet (•)
      const raw = itens.replace(/[{}"]/g, " ");
      const parts = raw
        .split(/[\n;,•]/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
      if (parts.length === 0) return "Itens não informados";

      const lines: string[] = [];
      let inSection = false; // estamos após um título (produto)

      const upperRatio = (s: string) => {
        const letters = s.match(/\p{L}/gu) || [];
        if (letters.length === 0) return 0;
        const uppers = letters.filter((ch) => ch === ch.toUpperCase()).length;
        return uppers / letters.length;
      };

      for (let p of parts) {
        // Remove apenas bullets iniciais, preservando hífen para detectar detalhe
        const noLeadingBullets = p.replace(/^[•\s]+/, "");
        const hasHyphenPrefix = /^[-–—]\s*/.test(noLeadingBullets);
        const text = noLeadingBullets.replace(/^[-–—]\s*/, "").trim();
        if (!text) continue;

        const startsWithQty = /^\d+\s*[xX]\b/.test(text);
        const hasBrand = /kara[ií]ba/i.test(text);
        const isUpperish = upperRatio(text) >= 0.6 && text.length >= 4;

        // Título: não começa com hífen e tem marca, ou quantidade no início, ou é majoritariamente maiúsculo
        const isTitle = !hasHyphenPrefix && (hasBrand || startsWithQty || isUpperish);

        if (isTitle) {
          inSection = true;
          lines.push(`<span class="item-title">• ${text.toUpperCase()}</span>`);
        } else {
          // Detalhe: qualquer linha com hífen OU (sem hífen mas no contexto de um título atual)
          lines.push(`<span class="item-detail">• ${text}</span>`);
        }
      }

      return lines.join('\n');
    };
    // Gerar HTML para 2 cópias do cupom
    const generateCupomHTML = (copyNumber: number) => `
      <div class="cupom">
        <div class="center bold">RESTAURANTE E LANCHONETE KARAÍBA</div>
        <div class="center">Souza & Belmiro LTDA</div>
        <div class="center">CNPJ: 08.892.783/0001-77</div>
        <div class="center">Rua Rafael Marino Neto, 266</div>
        <div class="center">Jardim Indaia, Uberlândia - MG</div>
        <div class="center">CEP: 38411-186</div>
        <div class="divider"></div>
        
        <div class="field"><span class="bold">Pedido:</span> ${order.codigo_pedido || "N/A"}</div>
        <div class="field"><span class="bold">Data:</span> ${currentDate}</div>
        <div class="field"><span class="bold">Cliente:</span> ${order.nome_cliente || "N/A"}</div>
        <div class="field"><span class="bold">Telefone:</span> ${order.telefone || "N/A"}</div>
        <div class="field"><span class="bold">Endereço:</span> ${order.endereco_completo || "N/A"}</div>
        <div class="field"><span class="bold">Bairro:</span> ${order.bairro || "N/A"}</div>
        <div class="divider"></div>
        
        <div class="bold">ITENS:</div>
        <div class="itens-container">
          ${formatItens(order.itens).split('\n').map(item => `<div class="item-line">${item}</div>`).join('')}
        </div>
        
        <div class="divider"></div>
        
        <div class="field"><span class="bold">Valor do pedido:</span> R$ ${formatCurrency(order.valor_pedido)}</div>
        <div class="field"><span class="bold">Taxa de entrega:</span> R$ ${formatCurrency(order.taxa_entrega)}</div>
        <div class="divider"></div>
        <div class="item bold"><span>TOTAL</span><span>R$ ${calculateTotal()}</span></div>
        <div class="divider"></div>
        
        <div class="field"><span class="bold">Pagamento:</span> ${order.forma_pagamento || "N/A"}</div>
        <div class="field"><span class="bold">Tempo de entrega:</span> ${order.tempo_entrega_estimado || "N/A"}</div>
        <div class="field"><span class="bold">Status:</span> ${order.status || "N/A"}</div>
        <div class="divider"></div>
        
        <div class="center">Agradecemos pela preferência!</div>
        <div class="center">Restaurante e Lanchonete Karaíba</div>
        
        ${copyNumber === 1 ? '<div class="center bold" style="margin-top: 10px;">1ª VIA - CLIENTE</div>' : '<div class="center bold" style="margin-top: 10px;">2ª VIA - ESTABELECIMENTO</div>'}
      </div>
      
      ${copyNumber === 1 ? '<div style="page-break-after: always;"></div>' : ''}
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Cupom Fiscal - ${order.codigo_pedido}</title>
          <style>
            @page {
              margin: 0;
              size: auto;
            }
            
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              font-weight: bold;
            }
            
            .cupom {
              width: 58mm;
              margin: 20px auto;
              padding: 10px;
              border: 1px dashed #000;
              font-size: 15px;
              line-height: 1.4;
              font-weight: bold;
            }
            
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider {
              border-top: 1px dashed #000;
              margin: 5px 0;
            }
            .item {
              display: flex;
              justify-content: space-between;
              margin: 2px 0;
            }
            .field {
              margin: 2px 0;
            }
            
            .itens-container {
              margin: 5px 0;
              font-size: 13px;
              font-weight: bold;
            }
            
            .item-line {
              margin: 3px 0;
              line-height: 1.3;
            }
            
            .item-title {
              font-weight: bold;
              text-transform: uppercase;
            }
            
            .item-detail {
              font-weight: normal;
            }
            
            @media print { 
              @page {
                margin: 0 !important;
                size: auto !important;
              }
              
              body { 
                margin: 0 !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                font-weight: bold !important;
              }
              
              .cupom { 
                margin: 0 !important; 
                border: none !important;
                page-break-inside: avoid !important;
                font-weight: bold !important;
              }
              
              .itens-container {
                font-size: 13px !important;
                font-weight: bold !important;
              }
              
              .item-line {
                margin: 3px 0 !important;
                line-height: 1.3 !important;
              }
              
              .item-title {
                font-weight: bold !important;
                text-transform: uppercase !important;
              }
              
              .item-detail {
                font-weight: normal !important;
              }
              
              html, body {
                height: auto !important;
                overflow: visible !important;
              }
            }
          </style>
        </head>
        <body>
          ${generateCupomHTML(1)}
          ${generateCupomHTML(2)}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return { printOrder };
};