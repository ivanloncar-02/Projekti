import React, { useState } from 'react';
import { StarRating } from '@/components/ui/star-rating';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ComponentTest: React.FC = () => {
  const [rating, setRating] = useState(3);
  const [progress, setProgress] = useState(60);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Component Testing Page - Phase 3
        </h1>

        {/* Star Rating Test */}
        <Card>
          <CardHeader>
            <CardTitle>Star Rating Component</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Interactive (click to rate):</p>
              <StarRating value={rating} onChange={setRating} size="lg" />
              <p className="mt-2 text-sm">Current value: {rating}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Read-only:</p>
              <StarRating value={4} readonly size="md" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Small size:</p>
              <StarRating value={5} readonly size="sm" />
            </div>
          </CardContent>
        </Card>

        {/* Progress Bar Test */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Component</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Current: {progress}%
              </p>
              <Progress value={progress} className="h-2" />
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => setProgress(Math.max(0, progress - 10))}
                >
                  -10%
                </Button>
                <Button
                  size="sm"
                  onClick={() => setProgress(Math.min(100, progress + 10))}
                >
                  +10%
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Different heights:</p>
              <Progress value={75} className="h-1 mb-2" />
              <Progress value={50} className="h-3 mb-2" />
              <Progress value={25} className="h-4" />
            </div>
          </CardContent>
        </Card>

        {/* Badge Test */}
        <Card>
          <CardHeader>
            <CardTitle>Badge Variants</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge className="bg-green-100 text-green-800">Custom Green</Badge>
          </CardContent>
        </Card>

        {/* Dropdown Menu Test */}
        <Card>
          <CardHeader>
            <CardTitle>Dropdown Menu Component</CardTitle>
          </CardHeader>
          <CardContent>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Open Dropdown</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Test Menu</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Item 1</DropdownMenuItem>
                <DropdownMenuItem>Item 2</DropdownMenuItem>
                <DropdownMenuItem>Item 3</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>

        {/* Notification Bell Test */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Bell (Navbar Component)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">
                This component is integrated in the navbar.
                Check the top-right corner of the page.
              </p>
              <div className="border border-gray-200 p-4 rounded-lg bg-white">
                <NotificationBell />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Button Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Button Variants (for reference)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button className="bg-green-600 hover:bg-green-700">
              Green (Approve)
            </Button>
          </CardContent>
        </Card>

        {/* Card Grid Test */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Card Grid (Responsive)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>Student Card {i}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Company</p>
                      <p className="text-sm text-gray-900">Test Company {i}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Progress</p>
                      <Progress value={i * 30} className="h-2 mb-1" />
                      <p className="text-xs text-gray-600">{i * 3}/10 entries approved</p>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      View Progress
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Status Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800">
            <ul className="list-disc list-inside space-y-2">
              <li>All components should render without errors</li>
              <li>Star ratings should be clickable and change on hover</li>
              <li>Progress bar should animate when values change</li>
              <li>Dropdown should open/close on click</li>
              <li>Cards should be responsive (resize browser to test)</li>
              <li>Check browser console for any errors (F12)</li>
              <li>Notification bell is in the navbar (top-right)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
