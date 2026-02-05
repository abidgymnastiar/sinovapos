<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class stocks extends Model
{
    protected $fillable = [
        'product_id',
        'date',
        'opening_stock',
        'closing_stock',
        'sold',
    ];
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
