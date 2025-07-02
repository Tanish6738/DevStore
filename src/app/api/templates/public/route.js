import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/connectDB';
import { Collection } from '../../../../../lib/models';

// GET /api/templates/public - Get all public templates
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 12;
    const page = parseInt(searchParams.get('page')) || 1;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';

    // Build query for public templates
    const query = {
      $or: [
        { isTemplate: true },
        { 'templateData.isTemplate': true }
      ],
      $and: [
        {
          $or: [
            { isPublic: true },
            { 'templateData.isPublicTemplate': true }
          ]
        }
      ]
    };

    // Add category filter if specified
    if (category && category !== 'all') {
      query.$and.push({
        $or: [
          { category: category },
          { 'templateData.templateCategory': category }
        ]
      });
    }

    // Add search filter if specified
    if (search) {
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'templateData.description': { $regex: search, $options: 'i' } }
        ]
      });
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'popular':
        sortObj = { 
          usageCount: -1, 
          'templateData.usageCount': -1, 
          createdAt: -1 
        };
        break;
      case 'rating':
        sortObj = { 
          averageRating: -1, 
          'templateData.averageRating': -1, 
          createdAt: -1 
        };
        break;
      case 'newest':
      default:
        sortObj = { createdAt: -1 };
        break;
    }

    // Get templates with pagination
    const templates = await Collection.find(query)
      .populate('createdBy', 'firstName lastName username displayName avatarUrl')
      .sort(sortObj)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Transform templates for consistent API response
    const formattedTemplates = templates.map(template => ({
      ...template,
      title: template.name,
      description: template.description || template.templateData?.description,
      language: template.templateData?.language || template.category,
      rating: template.averageRating || template.templateData?.averageRating || 0,
      usageCount: template.usageCount || template.templateData?.usageCount || 0,
    }));

    // Get total count for pagination
    const totalCount = await Collection.countDocuments(query);

    // Get unique categories for filtering
    const allTemplates = await Collection.find(
      {
        $or: [
          { isTemplate: true },
          { 'templateData.isTemplate': true }
        ],
        $and: [
          {
            $or: [
              { isPublic: true },
              { 'templateData.isPublicTemplate': true }
            ]
          }
        ]
      }, 
      { 
        category: 1, 
        'templateData.templateCategory': 1,
        'templateData.language': 1
      }
    );
    
    const categories = [...new Set(
      allTemplates.flatMap(t => [
        t.category, 
        t.templateData?.templateCategory,
        t.templateData?.language
      ]).filter(Boolean)
    )];

    return NextResponse.json({
      templates: formattedTemplates,
      categories,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching public templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
