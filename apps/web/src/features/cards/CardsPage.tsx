import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CardArtwork } from '../../components/CardArtwork';
import { ErrorState, LoadingState, PageTitle } from '../../components/QueryState';
import { useCards, useSettings } from '../../data/hooks';
import { getLocalizedCard, getText } from '../../lib/i18n';

const filters = [
  { label: 'All cards', value: 'all' },
  { label: 'Major Arcana', value: 'major' },
  { label: 'Wands', value: 'wands' },
  { label: 'Cups', value: 'cups' },
  { label: 'Swords', value: 'swords' },
  { label: 'Pentacles', value: 'pentacles' },
] as const;

type CardFilter = (typeof filters)[number]['value'];

export function CardsPage() {
  const { data: cards, isPending, error } = useCards();
  const { data: settings } = useSettings();
  const t = getText(settings?.language);
  const [filter, setFilter] = useState<CardFilter>('all');
  const [search, setSearch] = useState('');
  const filteredCards = useMemo(
    () =>
      (cards ?? [])
        .map((card) => getLocalizedCard(card, settings?.language))
        .filter((card) => filter === 'all' || card.arcana === filter || card.suit === filter)
        .filter((card) => {
          const query = search.trim().toLocaleLowerCase();
          return (
            !query ||
            card.name.toLocaleLowerCase().includes(query) ||
            card.keywords.upright.join(' ').toLocaleLowerCase().includes(query) ||
            card.keywords.reversed.join(' ').toLocaleLowerCase().includes(query)
          );
        })
        .sort((a, b) => a.arcana.localeCompare(b.arcana) || a.number - b.number),
    [cards, filter, search, settings?.language],
  );

  const filterLabels = {
    all: t.cards.allCards,
    major: t.cards.majorArcana,
    wands: t.cards.wands,
    cups: t.cards.cups,
    swords: t.cards.swords,
    pentacles: t.cards.pentacles,
  };

  return (
    <section className="content-page">
      <PageTitle
        eyebrow={t.cards.eyebrow}
        title={t.cards.title}
        description={t.cards.description}
      />
      <label className="search-field">
        <span aria-hidden="true">⌕</span>
        <span className="visually-hidden">Search cards by name or keyword</span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t.cards.searchPlaceholder}
        />
        <kbd>/</kbd>
      </label>
      <div className="filter-list" role="group" aria-label="Filter cards">
        {filters.map((item) => (
          <button
            className={`filter-chip${filter === item.value ? ' is-selected' : ''}`}
            key={item.value}
            type="button"
            aria-pressed={filter === item.value}
            onClick={() => setFilter(item.value)}
          >
            {filterLabels[item.value]}
          </button>
        ))}
      </div>
      {isPending ? (
        <LoadingState label={t.cards.loading} />
      ) : error ? (
        <ErrorState error={error} />
      ) : (
        <>
          <p className="result-count">
            {filteredCards.length} {filteredCards.length === 1 ? t.common.card : t.common.cardsPlural}
          </p>
          {filteredCards.length === 0 ? (
            <div className="empty-state">
              <p>{t.cards.noMatch}</p>
              <button
                className="text-link"
                type="button"
                onClick={() => {
                  setSearch('');
                  setFilter('all');
                }}
              >
                {t.cards.clearFilters}
              </button>
            </div>
          ) : (
            <div className="card-grid">
              {filteredCards.map((card) => (
                <Link className="library-card" to={`/cards/${card.id}`} key={card.id}>
                  <CardArtwork card={card} />
                  <span className="library-card-name">{card.name}</span>
                  <span className="library-card-meta">
                    {card.arcana === 'major' ? t.cards.majorArcana : card.suit}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
