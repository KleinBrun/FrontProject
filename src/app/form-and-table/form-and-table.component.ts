import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import date from 'date-and-time';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from './api.service';
import { firstValueFrom } from 'rxjs';

export interface FormData {
  _id?: string;
  event_type: string;
  description: string;
  event_date: string;
  create_at?: string;
}

export interface ApiResponse {
  logs: FormData[];
}

@Component({
  selector: 'app-form-and-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  providers: [ApiService],
  templateUrl: './form-and-table.component.html',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' })),
      ]),
    ]),
  ],
})
export class FormAndTableComponent implements OnInit {
  form!: FormGroup;
  filterForm!: FormGroup;
  dataList: FormData[] = [];
  filteredDataList: FormData[] = [];
  pagedDataList: FormData[] = [];
  currentPage: number = 1;
  pageSize: number = 5;
  totalItems: number = 0;
  math = Math;

  constructor(private fb: FormBuilder, private apiService: ApiService) { }

  ngOnInit() {
    this.form = this.fb.group({
      datetime: ['', [Validators.required]],
      description: ['', [Validators.required]],
    });

    this.filterForm = this.fb.group({
      type: [''],
      date: [''],
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.applyFilter();
    });
    this.loadData();
  }

  async loadData() {
    try {
      const data: ApiResponse = await firstValueFrom(this.apiService.getData());
      this.dataList = data.logs;
      this.applyFilter();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  async onSubmit() {
    if (this.form.valid) {
      const { datetime, description } = this.form.value;
      const dateFormat = date.format(new Date(datetime), 'YYYY/MM/DD HH:mm:ss');
      const formData: FormData = { event_date: dateFormat, event_type: "FORMULARIO", description };

      try {
        const response = await firstValueFrom(this.apiService.submitForm(formData));
        console.log('Form submitted successfully:', response);
        this.loadData();
        this.form.reset();
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  applyFilter() {
    const { type, date } = this.filterForm.value;
    this.filteredDataList = this.dataList.filter(item => {
      const matchesType = type ? item.event_type.toLowerCase().includes(type.toLowerCase()) : true;
      const matchesDate = date ? new Date(item.event_date).toISOString().slice(0, 10) === date : true;
      return matchesType && matchesDate;
    });
    this.totalItems = this.filteredDataList.length;
    this.updatePagedList();
  }

  updatePagedList() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedDataList = this.filteredDataList.slice(startIndex, endIndex);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedList();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedList();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedList();
    }
  }

  pageNumbers(): number[] {
    const pageCount = Math.min(5, this.totalPages);
    const halfWay = Math.ceil(pageCount / 2);
    const isNearBeginning = this.currentPage <= halfWay;
    const isNearEnd = this.currentPage > this.totalPages - halfWay;

    const pageArray: number[] = [];
    if (isNearBeginning) {
      for (let i = 1; i <= pageCount; i++) {
        pageArray.push(i);
      }
    } else if (isNearEnd) {
      for (let i = this.totalPages - pageCount + 1; i <= this.totalPages; i++) {
        pageArray.push(i);
      }
    } else {
      for (let i = this.currentPage - halfWay + 1; i <= this.currentPage + halfWay - 1; i++) {
        pageArray.push(i);
      }
    }
    return pageArray;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }
}