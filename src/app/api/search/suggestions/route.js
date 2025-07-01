import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/connectDB';
import { Collection, Product } from '../../../../../lib/models';


export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all'; // 'products', 'collections', or 'all'

    if (!q || q.trim() === '' || q.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = [];

    // Product suggestions
    if (type === 'all' || type === 'products') {
      const productSuggestions = await Product.find({
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
          { 'metadata.tags': { $regex: q, $options: 'i' } },
        ],
      })
        .select('title category')
        .limit(5);

      suggestions.push(
        ...productSuggestions.map((product) => ({
          type: 'product',
          text: product.title,
          category: product.category,
        }))
      );
    }

    // Collection suggestions (public only)
    if (type === 'all' || type === 'collections') {
      const collectionSuggestions = await Collection.find({
        isPublic: true,
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
        ],
      })
        .select('name')
        .limit(5);

      suggestions.push(
        ...collectionSuggestions.map((collection) => ({
          type: 'collection',
          text: collection.name,
        }))
      );
    }

    // Category suggestions
    if (type === 'all' || type === 'products') {
      const categories = await Product.distinct('category', {
        category: { $regex: q, $options: 'i' },
      });

      suggestions.push(
        ...categories.slice(0, 3).map((category) => ({
          type: 'category',
          text: category,
        }))
      );
    }

    // Tag suggestions
    if (type === 'all' || type === 'products') {
      const tags = await Product.distinct('metadata.tags', {
        'metadata.tags': { $regex: q, $options: 'i' },
      });

      suggestions.push(
        ...tags.slice(0, 3).map((tag) => ({
          type: 'tag',
          text: tag,
        }))
      );
    }

    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.text === suggestion.text && s.type === suggestion.type)
      )
      .slice(0, 10);

    return NextResponse.json({ suggestions: uniqueSuggestions });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json(
      { error: 'Error fetching suggestions' },
      { status: 500 }
    );
  }
}
