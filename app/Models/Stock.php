<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    protected $fillable = [
        'product_id',
        'date',
        'opening_stock',
        'closing_stock',
        'sold',
    ];

    // Kalkulasi 'sold'
    public function calculateSold()
    {
        return max(0, $this->opening_stock - $this->closing_stock);
    }

    // Pastikan perhitungan ini dijalankan sebelum menyimpan data
    public static function boot()
    {
        parent::boot();

        static::saving(function ($stock) {
            $stock->sold = $stock->calculateSold(); // Hitung sold saat penyimpanan
        });
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
