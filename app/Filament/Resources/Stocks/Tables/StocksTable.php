<?php

namespace App\Filament\Resources\Stocks\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;

class StocksTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('date')->sortable(),
                TextColumn::make('product.name')->label('Product'),
                TextColumn::make('opening_stock')->label('Opening Stock'),
                TextColumn::make('closing_stock')->label('Closing Stock'),
                TextColumn::make('sold')
                    ->label('Sold')
                    ->sortable(),
            ])
            ->filters([
                //
            ])
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
