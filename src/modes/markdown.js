import React from 'react';
import hljs from 'highlight.js';
import MarkdownIt from 'markdown-it';
// markdown-it plugins
import emoji from 'markdown-it-emoji';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
import footnote from 'markdown-it-footnote';
import deflist from 'markdown-it-deflist';
import abbr from 'markdown-it-abbr';
import ins from 'markdown-it-ins';
import mark from 'markdown-it-mark';
import twemoji from 'twemoji';
import { higlightSourceWithNinjas, ninjaRegex } from '../components/editor/lineNinja';
import bootstrap from './boostrap';

const mdOptions = {
  linkify: true,
  typographer: true,
  highlight: code => higlightSourceWithNinjas(
    code,
    src => hljs.highlightAuto(src).value,
    ninjaRegex,
  ),
};

const plugins = [emoji, sub, sup, footnote, deflist, abbr, ins, mark];
const md = plugins.reduce((_md, mode) => _md.use(mode), MarkdownIt(mdOptions));

md.renderer.rules.emoji = (token, idx) => twemoji.parse(token[idx].content);
// eslint-disable-next-line react/jsx-no-bind
const renderer = md.render.bind(md);

const markdown = {
  name: 'markdown',
  convert: src => ({ html: renderer(src), suggestions: [] }),
  lineSafeInsert: (line, content) => {
    // If line does not contain words, it is
    // most likely not going to render into
    // anything. Prevent messing up table
    // markup etc.
    if (!line.match(/\w/)) {
      return line;
    }
    // Skip code block start / end (~~~,---)
    // Skip footnotes ([^...])
    // Skip abbreviations (*[...])
    if (line.match(/(```|~~~|\[\^|\*\[)/)) {
      return line;
    }
    // if image, place after
    if (line.match(/!\[.*\]\(.*\)/)) {
      return line.replace(/(.*)\)(.*)/, `$1)${content}$2`);
    }
    // if emoji do not spoil
    if (line.match(/:/)) {
      return line.replace(/(:[^:]*:)|(\w+)/, `$1$2${content}`);
    }
    // else append to any word
    return line.replace(/(.*)(\w)(.*)/, `$1$2${content}$3`);
  },
  symbols: {
    bold: '**',
    italic: '_',
    ul: ' - ',
    ol: '1. ',
    quote: '> ',
  },
  getPathPrefix: (lineStart) => {
    if (lineStart.match(/\[\S*\]\(\S*$/)) {
      return lineStart.split('(').slice(-1)[0];
    }
    return null;
  },
  renderJsxStyle: () => (
    <style jsx global>{`
      .markdown-body {
        box-sizing: border-box;
        min-width: 200px;
        max-width: 980px;
        margin: 0 auto;
        padding: 45px;
      }

      @media (max-width: 767px) {
        .markdown-body {
          padding: 15px;
        }
      }
      .emoji {
        height: 1.2em;
      }
    `}
    </style>
  ),
  previewClassName: 'markdown-body',
};

export default bootstrap(markdown);
