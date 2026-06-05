<?php

namespace App\Models\Concerns;

/**
 * Transparent per-locale field translations backed by a JSON `translations`
 * column shaped as { "en": { "title": "...", "body": "..." } }.
 *
 * A model using this trait declares `protected array $translatable = [...]`.
 * When the active locale is non-default and a translation exists, reads of
 * those attributes (both direct PHP access and array/JSON serialization for
 * Inertia) return the translated value; otherwise they fall back to the base
 * column. The raw `translations` column is hidden from serialized output.
 *
 * Admin code that must edit the base values should use rawTranslatable()/
 * getRawOriginal() to bypass translation.
 */
trait HasTranslations
{
    public static function bootHasTranslations(): void
    {
        // no-op; reserved for future global behaviour
    }

    public function initializeHasTranslations(): void
    {
        if (! isset($this->casts['translations'])) {
            $this->casts['translations'] = 'array';
        }
        if (! in_array('translations', $this->fillable, true)) {
            $this->fillable[] = 'translations';
        }
    }

    /** Raw translations array regardless of how the attribute is cast/loaded. */
    public function rawTranslations(): array
    {
        $raw = $this->attributes['translations'] ?? null;

        if (is_array($raw)) {
            return $raw;
        }
        if (is_string($raw) && $raw !== '') {
            return json_decode($raw, true) ?: [];
        }

        return [];
    }

    protected function localizedValue(string $key, mixed $original): mixed
    {
        // Base content lives in the original columns (zh-TW). For any active
        // locale, use its translation when present; otherwise fall back to base.
        $value = $this->rawTranslations()[app()->getLocale()][$key] ?? null;

        return ($value === null || $value === '') ? $original : $value;
    }

    public function getAttribute($key)
    {
        $value = parent::getAttribute($key);

        if (in_array($key, $this->translatable ?? [], true)) {
            return $this->localizedValue($key, $value);
        }

        return $value;
    }

    public function attributesToArray()
    {
        $array = parent::attributesToArray();

        foreach (($this->translatable ?? []) as $key) {
            if (array_key_exists($key, $array)) {
                $array[$key] = $this->localizedValue($key, $array[$key]);
            }
        }

        unset($array['translations']);

        return $array;
    }
}
