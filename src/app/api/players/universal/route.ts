import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'src', 'data', 'players-universal.json');

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ success: false, error: 'Universal players database not found. Please sync.' });
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const players = JSON.parse(fileContent);

        return NextResponse.json({
            success: true,
            players,
            count: players.length,
            lastUpdated: new Date().toISOString() // In real app, check file modified time
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to read players' }, { status: 500 });
    }
}
