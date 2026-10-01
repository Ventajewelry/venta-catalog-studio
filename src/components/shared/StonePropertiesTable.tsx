import React from 'react';

type StoneProduct = { stoneDetails?: string };
const headers = ['Taş', 'Karat', 'Adet', 'Renk', 'Berraklık', 'Şekil'];

export function stoneRows(product?: StoneProduct): string[][] {
  return (product?.stoneDetails || '').split(/\r?\n/)
    .map(line => line.split(' · ').map(cell => cell.trim()))
    .filter(cells => cells.length === headers.length && cells.some(Boolean));
}

export function StonePropertiesTable({ product, style }: { product: StoneProduct; style?: React.CSSProperties }) {
  const rows = stoneRows(product);
  if (!rows.length) return null;
  return <table aria-label="Taş özellikleri" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: 'inherit', color: 'inherit', ...style }}>
    <colgroup>{[22,13,12,13,20,20].map((width,index)=><col key={index} style={{width:`${width}%`}}/>)}</colgroup><thead><tr>{headers.map(title => <th key={title} style={{ border: '1px solid #e1e5eb', padding: '.35em .2em', background: '#f8f9fb', fontWeight: 600, overflowWrap: 'normal', wordBreak: 'normal', lineHeight: 1.25 }}>{title}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{row.map((value, column) => <td key={column} style={{ border: '1px solid #e1e5eb', padding: '.35em .2em', overflowWrap: 'normal', wordBreak: 'normal', lineHeight: 1.25 }}>{value}</td>)}</tr>)}</tbody>
  </table>;
}

const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
export function stonePropertiesHtml(product?: StoneProduct): string {
  const rows = stoneRows(product);
  if (!rows.length) return '';
  const cellStyle = 'border:1px solid #e1e5eb;padding:3px 2px;overflow-wrap:anywhere';
  return '<table aria-label="Taş özellikleri" style="width:100%;table-layout:fixed;border-collapse:collapse;font-size:8px"><colgroup>{[22,13,12,13,20,20].map((width,index)=><col key={index} style={{width:`${width}%`}}/>)}</colgroup><thead><tr>'
    + headers.map(title => '<th style="' + cellStyle + ';background:#f8f9fb">' + escape(title) + '</th>').join('')
    + '</tr></thead><tbody>' + rows.map(row => '<tr>' + row.map(value => '<td style="' + cellStyle + '">' + escape(value) + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
}

