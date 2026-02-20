<?php

namespace App\Filament\Resources\Stocks\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Illuminate\Database\Eloquent\Builder;
use Filament\Tables\Filters\Filter;
use Filament\Forms\Components\DatePicker;
use Carbon\Carbon;

class StocksTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('date')->sortable(),
                TextColumn::make('product.name')
                    ->label('Product')
                    ->searchable(),
                TextColumn::make('opening_stock')->label('Opening Stock'),
                TextColumn::make('closing_stock')->label('Closing Stock'),
                TextColumn::make('sold')
                    ->label('Sold')
                    ->sortable(),
            ])
            ->filters([
                Filter::make('date_range')
                    ->form([
                        DatePicker::make('from')
                            ->label('Dari Tanggal')
                            ->default(Carbon::today()),
                        DatePicker::make('until')
                            ->label('Sampai Tanggal')
                            ->default(Carbon::today()),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['from'],
                                fn(Builder $query, $date): Builder => $query->whereDate('date', '>=', $date),
                            )
                            ->when(
                                $data['until'],
                                fn(Builder $query, $date): Builder => $query->whereDate('date', '<=', $date),
                            );
                    })
                    // HAPUS baseQuery() karena akan memaksa filter selalu hari ini
                    ->indicateUsing(function (array $data): array {
                        $indicators = [];

                        if ($data['from'] ?? null) {
                            $indicators[] = 'Dari: ' . Carbon::parse($data['from'])->isoFormat('D MMMM Y');
                        }

                        if ($data['until'] ?? null) {
                            $indicators[] = 'Sampai: ' . Carbon::parse($data['until'])->isoFormat('D MMMM Y');
                        }

                        return $indicators;
                    }),
            ])
            ->defaultSort('date', 'desc')
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
